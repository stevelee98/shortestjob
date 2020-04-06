import StorageUtil from "utils/storageUtil";
import DateUtil from "utils/dateUtil";
import { Platform } from "react-native";

export default class ApiUtil {

    // static Header = {
    //     "Accept": "application/json",
    //     'Content-Type': 'application/json',
    //     'X-APITOKEN': ApiUtil.getToken()
    // }

    /**
     * Get header api eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJUw7QgSHl1biJ9.-QODYXYmJHofeQZpzcgJM21UMr3AlKDRlp1CrkKSJc88ITWd68TIVoG5hBfXPdj4uhJCaR-RLqrYtZRowbPasA
     */
    static getHeader() {
        let header = new Headers({
            "Accept": "application/json",
            'Content-Type': 'application/json',
            'X-APITOKEN': global.token,
            'X-CLIENT-TIME': DateUtil.parseNow(DateUtil.FORMAT_DATE_TIME_ZONE),
            'X-PLATFORM' : Platform.OS   
        })
        console.log('API header', header)
        return header
    }
}