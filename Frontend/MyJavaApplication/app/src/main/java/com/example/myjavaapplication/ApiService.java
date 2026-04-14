package com.example.myjavaapplication;

import java.util.List;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PUT;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {

    @POST("api/login")
    Call<AuthResponse> loginUser(@Body LoginRequest loginRequest);

    @POST("api/signup")
    Call<ResponseBody> signupUser(@Body SignupRequest signupRequest);

    @PUT("usage")
    Call<Void> syncUsage(@Header("Authorization") String token, @Body UsageRequest request);

    @GET("api/dashboard/{userId}")
    Call<List<DashBoardResponseDTO>> getDashboard(@Header("Authorization") String token, @Path("userId") Long userId);
}
