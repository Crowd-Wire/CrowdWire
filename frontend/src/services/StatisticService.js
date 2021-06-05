import { API_BASE } from "config";
import AuthenticationService from "./AuthenticationService";


class StatisticService {

    getStatistics() {
        return fetch(API_BASE + 'statistics/', {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }

}

export default new StatisticService();