package com.example.myjavaapplication;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.utils.ColorTemplate;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private BarChart barChart;
    private ApiService apiService;
    private long userId;
    private String jwtToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        barChart = findViewById(R.id.barChart);

        userId = getIntent().getLongExtra("USER_ID", -1);
        jwtToken = getIntent().getStringExtra("JWT_TOKEN"); // Get Token

        if (userId == -1 || jwtToken == null) {
            Toast.makeText(this, "Error: Authentication failed!", Toast.LENGTH_SHORT).show();
            finish(); 
            return;
        }

        apiService = RetrofitClient.getClient().create(ApiService.class);

        loadData();
    }

    private void loadData() {
        // Send JWT Token in Header
        apiService.getDashboard("Bearer " + jwtToken, userId).enqueue(new Callback<List<DashBoardResponseDTO>>() {
            @Override
            public void onResponse(Call<List<DashBoardResponseDTO>> call, Response<List<DashBoardResponseDTO>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<DashBoardResponseDTO> list = response.body();

                    if (list.isEmpty()) {
                        Toast.makeText(DashboardActivity.this, "No data available for today", Toast.LENGTH_LONG).show();
                    } else {
                        renderBarChart(list);
                        RecommendationAdapter adapter = new RecommendationAdapter(list);
                        recyclerView.setAdapter(adapter);
                    }
                } else {
                    Toast.makeText(DashboardActivity.this, "Server Error: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<DashBoardResponseDTO>> call, Throwable t) {
                Log.e("Dashboard", "Network Failure: " + t.getMessage());
                Toast.makeText(DashboardActivity.this, "Failed to connect to backend", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void renderBarChart(List<DashBoardResponseDTO> list) {
        ArrayList<BarEntry> entries = new ArrayList<>();
        for (int i = 0; i < list.size(); i++) {
            entries.add(new BarEntry(i, (float) list.get(i).getUsageTime()));
        }

        BarDataSet set = new BarDataSet(entries, "App Usage (Mins)");
        set.setColors(ColorTemplate.MATERIAL_COLORS); 
        set.setValueTextSize(12f);

        BarData data = new BarData(set);
        barChart.setData(data);
        barChart.getDescription().setText("Your Daily App Usage");
        barChart.animateY(1000); 
        barChart.invalidate(); 
    }
}
