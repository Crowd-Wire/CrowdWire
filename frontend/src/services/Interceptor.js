import AuthenticationService from './AuthenticationService.js';
import fetchIntercept from 'fetch-intercept';
import useAuthStore from 'stores/useAuthStore.ts';
const originalRequest = {}
export const interceptor = fetchIntercept.register({    
    request: function (url, config) {
        originalRequest.url = url
        originalRequest.config = config
        return [url, config];
    },
    requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call        
        return Promise.reject(error);
    },
 
    response: async function (response) {
        if(response.status === 401)
        {
            if(!AuthenticationService.getToken()){
                return Promise.reject("No authentication token");
            }
            console.log(originalRequest);
            let config = originalRequest.config || {};
            let url = originalRequest.url;
            if(url.includes('token'))
            {
                // this makes so that there is no infinite loop
                interceptor()
                AuthenticationService.logout();
                return Promise.reject("Session expired");
            }
            else
            {
                return AuthenticationService.refreshToken()
                        .then((data) => {
                            return data.json();
                        }).then( (data) => {
                            if(data){
                                console.log("data");
                                console.log(data);
                                if(!useAuthStore.getState().guest_uuid)
                                    AuthenticationService.setToken(data,"AUTH");
                                else
                                    AuthenticationService.setToken(data, "GUEST");
                                config['headers']['Authorization'] = 'Bearer '+ data.access_token
                                return fetch(url, config)
                            }
                        })
                        .catch((error) => {
                            return Promise.reject(error)
                        })                            
            }            
        }
        else
        {
            return response
        }        
    },
 
    responseError: function (error) {
        // Handle an fetch error
        return Promise.reject(error);
    }
});