import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_LOCAL_BACKEND_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["Auth"],
    endpoints: (builder) => ({
        authorize: builder.mutation({
            query: ({ email, password }: { email: string; password?: string }) => {
                return {
                    url: "/user/login",
                    method: "post",
                    body: { email, password },
                };
            },
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    localStorage.setItem("token", data.token);
                } catch (err) {
                    console.error("Authorization failed:", err);
                }
            },
        }),
        registration: builder.mutation({
            query: ({ email, password, username }: { email: string; password: string, username: string }) => {
                return {
                    url: "/user/registration",
                    method: "post",
                    body: { email, password, username },
                };
            },
        })
    }),
});

export const {
    useAuthorizeMutation,
    useRegistrationMutation
} = authApi;
