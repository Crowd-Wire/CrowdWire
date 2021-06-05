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

    getActiveOnlineUsersCharts(start_date, end_date=undefined) {
        let query = "?start_date=" + start_date
        if (end_date)
            query += "&end_date=" + end_date
        return fetch(API_BASE + 'statistics/charts/active-users' + query, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }

    getNewRegisteredUsersCharts(start_date, end_date) {
        let query = "?start_date=" + start_date
        if (end_date)
            query += "&end_date=" + end_date
        return fetch(API_BASE + 'statistics/charts/new-users' + query, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Authorization" : "Bearer "+ AuthenticationService.getToken()  
            }
        })
    }
}

export default new StatisticService();