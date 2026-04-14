package com.example.myjavaapplication;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import bot.box.appusage.contract.UsageContracts;
import bot.box.appusage.handler.Monitor;
import bot.box.appusage.model.AppData;
import bot.box.appusage.utils.Duration;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity implements UsageContracts.View {

    private TextInputEditText etEmail, etPassword, etActualUsername, etConfirmPassword;
    private TextInputLayout tilActualUsername, tilConfirmPassword, tilEmail;
    private MaterialButton btnLogin, btnPermission, btnSync, btnDashboard;
    private View layoutPostLogin;
    private TextView tvSignupLink, tvTitle;
    private boolean isLoggedIn = false;
    private boolean isSignupMode = false;
    private ApiService apiService;
    private Long loggedInUserId = 1L; 
    private String jwtToken = "";
    private String selectedPeriod = "WEEK"; 

    // LIST OF APPS TO TRACK: Match these exactly with your Database provider_name
    private final List<String> TRACKED_APPS = Arrays.asList(
        "Spotify", "YouTube", "YouTube Premium", "JioHotstar", "Hotstar", "JioCinema", "Amazon Prime", "Prime Video", "Netflix"
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        apiService = RetrofitClient.getClient().create(ApiService.class);

        tvTitle = findViewById(R.id.tvTitle);
        etActualUsername = findViewById(R.id.etActualUsername);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        tilActualUsername = findViewById(R.id.tilActualUsername);
        tilEmail = findViewById(R.id.tilEmail);
        tilConfirmPassword = findViewById(R.id.tilConfirmPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvSignupLink = findViewById(R.id.tvSignupLink);
        layoutPostLogin = findViewById(R.id.layoutPostLogin);
        btnPermission = findViewById(R.id.btnPermission);
        btnSync = findViewById(R.id.btnSync);
        btnDashboard = findViewById(R.id.btnDashboard);

        tilActualUsername.setVisibility(View.GONE);
        tilConfirmPassword.setVisibility(View.GONE);
        layoutPostLogin.setVisibility(View.GONE);

        tvSignupLink.setOnClickListener(v -> {
            isSignupMode = true;
            tilActualUsername.setVisibility(View.VISIBLE);
            tilConfirmPassword.setVisibility(View.VISIBLE);
            tilEmail.setHint("Email Address");
            btnLogin.setText("Create Account");
            tvTitle.setText("Sign Up");
            tvSignupLink.setVisibility(View.GONE);
        });

        btnLogin.setOnClickListener(v -> {
            hideKeyboard();
            if (isSignupMode) performSignup();
            else performLogin();
        });

        btnPermission.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)));

        btnSync.setOnClickListener(v -> {
            if (checkUsagePermission()) {
                showSyncOptions();
            } else {
                showPermissionDeniedDialog();
            }
        });

        btnDashboard.setOnClickListener(v -> {
            if (!isLoggedIn) {
                Toast.makeText(this, "Please Login First!", Toast.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, DashboardActivity.class);
            intent.putExtra("USER_ID", loggedInUserId);
            intent.putExtra("JWT_TOKEN", jwtToken);
            startActivity(intent);
        });
    }

    private void showSyncOptions() {
        String[] options = {"Today's Usage", "Past Week", "Past Month"};
        new AlertDialog.Builder(this)
                .setTitle("Select Sync Period")
                .setItems(options, (dialog, which) -> {
                    switch (which) {
                        case 0:
                            selectedPeriod = "TODAY";
                            Monitor.scan().getAppLists(this).fetchFor(Duration.TODAY);
                            break;
                        case 1:
                            selectedPeriod = "WEEK";
                            Monitor.scan().getAppLists(this).fetchFor(Duration.WEEK);
                            break;
                        case 2:
                            selectedPeriod = "MONTH";
                            Monitor.scan().getAppLists(this).fetchFor(Duration.MONTH);
                            break;
                    }
                }).show();
    }

    @Override
    public void getUsageData(List<AppData> usageData, long mTotalUsage, int duration) {
        if (usageData != null && !usageData.isEmpty()) {
            List<AppUsageInfo> cleanList = new ArrayList<>();
            PackageManager pm = getPackageManager();

            for (AppData data : usageData) {
                try {
                    String appLabel = pm.getApplicationLabel(pm.getApplicationInfo(data.mPackageName, 0)).toString();
                    
                    // ONLY SYNC IF APP IS IN OUR TRACKED LIST
                    boolean isTracked = false;
                    for(String tracked : TRACKED_APPS) {
                        if (appLabel.toLowerCase().contains(tracked.toLowerCase())) {
                            isTracked = true;
                            appLabel = tracked; // Standardize name to match DB
                            break;
                        }
                    }

                    if (isTracked) {
                        long mins = data.mUsageTime / 60000;
                        long finalMins = (data.mUsageTime > 0 && mins == 0) ? 1 : mins;
                        
                        cleanList.add(new AppUsageInfo(appLabel, finalMins));
                        Log.i("USAGE_SYNC", "Adding Tracked App: " + appLabel + " | " + finalMins + "m");
                    }
                } catch (Exception e) {
                    // Skip if error
                }
            }

            if (cleanList.isEmpty()) {
                Toast.makeText(this, "No tracked subscriptions used in this period.", Toast.LENGTH_LONG).show();
                return;
            }

            UsageRequest request = new UsageRequest(loggedInUserId, cleanList, selectedPeriod);
            apiService.syncUsage("Bearer " + jwtToken, request).enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(MainActivity.this, "Sync Successful!", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(MainActivity.this, "Sync Failed: " + response.code(), Toast.LENGTH_SHORT).show();
                    }
                }
                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    Toast.makeText(MainActivity.this, "Laptop unreachable", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    @Override public void showProgress() {}
    @Override public void hideProgress() {}

    private void performSignup() {
        if (etActualUsername.getText() == null || etEmail.getText() == null || etPassword.getText() == null || etConfirmPassword.getText() == null) return;
        String username = etActualUsername.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String pass = etPassword.getText().toString().trim();
        String confirm = etConfirmPassword.getText().toString().trim();

        if (username.isEmpty() || email.isEmpty() || pass.isEmpty()) return;
        if (!pass.equals(confirm)) {
            tilConfirmPassword.setError("Mismatch");
            return;
        }

        apiService.signupUser(new SignupRequest(username, email, pass)).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(MainActivity.this, "Account Created!", Toast.LENGTH_SHORT).show();
                    switchToLoginMode();
                }
            }
            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Connection Error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void performLogin() {
        if (etEmail.getText() == null || etPassword.getText() == null) return;
        String userOrEmail = etEmail.getText().toString().trim();
        String pass = etPassword.getText().toString().trim();
        if (userOrEmail.isEmpty() || pass.isEmpty()) return;

        apiService.loginUser(new LoginRequest(userOrEmail, pass)).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    isLoggedIn = true;
                    jwtToken = response.body().getToken();
                    handleLoginSuccess(response.body().getUsername());
                } else {
                    Toast.makeText(MainActivity.this, "Login Failed", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Server not reachable", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void handleLoginSuccess(String user) {
        findViewById(R.id.loginCard).setVisibility(View.GONE);
        layoutPostLogin.setVisibility(View.VISIBLE);
        Toast.makeText(this, "Welcome " + user, Toast.LENGTH_SHORT).show();
    }

    private void switchToLoginMode() {
        isSignupMode = false;
        tilActualUsername.setVisibility(View.GONE);
        tilConfirmPassword.setVisibility(View.GONE);
        tilEmail.setHint("Username / Email");
        btnLogin.setText("Login");
        tvTitle.setText("Subscription Insight");
        tvSignupLink.setVisibility(View.VISIBLE);
    }

    private void hideKeyboard() {
        View view = this.getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    private boolean checkUsagePermission() {
        AppOpsManager appOps = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), getPackageName());
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private void showPermissionDeniedDialog() {
        new AlertDialog.Builder(this).setTitle("Permission Needed").setMessage("Find 'MyJavaApplication' in the list and turn it ON.")
                .setPositiveButton("Settings", (d, w) -> startActivity(new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)))
                .setNegativeButton("Cancel", null).show();
    }
}
