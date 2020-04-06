package com.boot.market.util;

import java.text.DecimalFormatSymbols;
import java.util.Locale;

/**
 * Ho tro xu li cac kieu string
 *
 * @author tuanlt
 * @since: 2:14 PM 5/12/2016
 */
public class StringUtil {

    /** The codau. */
    static char codau[] = { 'à', 'á', 'ả', 'ã', 'ạ', 'ă', 'ằ', 'ắ', 'ẳ', 'ẵ', 'ặ', 'â', 'ầ', 'ấ', 'ẩ', 'ẫ', 'ậ', 'À',
        'Á', 'Ả', 'Ã', 'Ạ', 'Ă', 'Ằ', 'Ắ', 'Ẳ', 'Ẵ', 'Ặ', 'Â', 'Ầ', 'Ấ', 'Ẩ', 'Ẫ', 'Ậ', 'è', 'é', 'ẻ', 'ẽ', 'ẹ',
        'ê', 'ề', 'ế', 'ể', 'ễ', 'ệ', 'È', 'É', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê', 'Ề', 'Ế', 'Ể', 'Ễ', 'Ệ', 'ì', 'í', 'ỉ', 'ĩ',
        'ị', 'Ì', 'Í', 'Ỉ', 'Ĩ', 'Ị', 'ò', 'ó', 'ỏ', 'õ', 'ọ', 'ô', 'ồ', 'ố', 'ổ', 'ỗ', 'ộ', 'ơ', 'ờ', 'ớ', 'ở',
        'ỡ', 'ợ', 'Ò', 'Ó', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ồ', 'Ố', 'Ổ', 'Ỗ', 'Ộ', 'Ơ', 'Ờ', 'Ớ', 'Ở', 'Ỡ', 'Ợ', 'ù', 'ú',
        'ủ', 'ũ', 'ụ', 'ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự', 'Ù', 'Ú', 'Ủ', 'Ũ', 'Ụ', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ', 'Ỳ', 'Ý',
        'Ỷ', 'Ỹ', 'Ỵ', 'đ', 'Đ', 'Ư', 'Ừ', 'Ử', 'Ữ', 'Ứ', 'Ự' };
    /** The khongdau. */
    static char khongdau[] = { 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a',
        'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'e', 'e', 'e', 'e',
        'e', 'e', 'e', 'e', 'e', 'e', 'e', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'i', 'i', 'i',
        'i', 'i', 'I', 'I', 'I', 'I', 'I', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o',
        'o', 'o', 'o', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'u',
        'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'u', 'U', 'U', 'U', 'U', 'U', 'y', 'y', 'y', 'y', 'y', 'Y',
        'Y', 'Y', 'Y', 'Y', 'd', 'D', 'U', 'U', 'U', 'U', 'U', 'U' };

    /**
     * Kiem tra null hoac rong
     * @param aString
     * @return
     */
    public static boolean isNullOrEmpty(String aString) {
        return (aString == null) || ("".equals(aString.trim()));
    }


    /**
     * Parse money
     * @param money
     * @return
     */
    public static String parseAmountMoney(String money) {
        Character groupSeparator = StringUtil.getDecimalFormatSymbols().getGroupingSeparator();
        Character decimalSapepator = StringUtil.getDecimalFormatSymbols().getDecimalSeparator();
        String result = "";
        if (!isNullOrEmpty(money)) {
            for (int i = money.length() - 1; i >= 0; i--) {
                int offsetLast = money.length() - 1 - i;
                if ((offsetLast > 0) && (offsetLast % 3) == 0 && (money.charAt(i) != '+') && (money.charAt(i) != '-'))
                    result = groupSeparator + result;
//                if(money.charAt(i) != decimalSapepator) {
                    result = money.charAt(i) + result;
//                }
            }

            if (result.substring(0, 1).equals(groupSeparator)) {
                result = result.substring(1, result.length() - 1);
            }
        }
        return result;
    }

    /**
     * Format du lieu kieu integer
     * @param value
     * @return
     */
    public static String formatInteger(int value){
        return String.format("%02d", value);
    }

    /**
     * Chuyen chuoi co dau thanh ko dau
     * @param input
     * @return
     */
    public static String getEngStringFromUnicodeString(String input) {
        if (isNullOrEmpty(input)) {
            return "";
        }
        input = input.trim();

        for (int i = 0; i < codau.length; i++) {
            input = input.replace(codau[i], khongdau[i]);
        }
        return input;
    }

    /**
     * parse money va remove .0 phia sau
     * @param input
     * @return
     */
    public static String parseMoneyWithTokenZero(String input ) {
        if(StringUtil.isNullOrEmpty(input)){
            return input;
        }
        if (input.length() >=3 && input.substring(input.length() - 2).equals(".0")) {
            input = input.substring(0, input.length() - 2);
        }
        String result = parseAmountMoney(input);
        return result;
    }

    /**
     * Decimail format
     * @return
     */
    public static DecimalFormatSymbols getDecimalFormatSymbols() {
        DecimalFormatSymbols otherSymbols = new DecimalFormatSymbols(Locale.getDefault());
        return otherSymbols;
    }

    /**
     * Split string and get count item
     * @param regularExpression
     * @param count
     * @return
     */
    public static String splitStringWithCount(String splitString, String regularExpression, int count){
        String[] split;
        String result = "";
        if (StringUtil.isNullOrEmpty(splitString)) {
            return splitString;
        } else {
            split = splitString.split(regularExpression);
            if(split.length > count-1){
               for(int i = 0, size = split.length; i < size ; i++){
                   if(i < count){
                       if(StringUtil.isNullOrEmpty(result)){
                           result = split[i];
                       }else {
                           result = result + regularExpression + split[i];
                       }
                   }else{
                       break;
                   }
               }
            }
        }
        return result;
    }

    /**
     * Check contain string unicode
     * @param address1
     * @param address2
     * @return
     */
    public static boolean checkContainStringUnicode(String address1, String address2){
        if (!StringUtil.isNullOrEmpty(address2)) {
            if (!StringUtil.isNullOrEmpty(address1) && StringUtil.getEngStringFromUnicodeString
                    (address1.toUpperCase()).contains(StringUtil.getEngStringFromUnicodeString(address2
                    .toUpperCase()))) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }

    /**
     * Resize image in html
     * @param bodyHTML
     * @return
     */
    public static String getHtmlResizeImage(String bodyHTML) {
        String head = "<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1" +
                ".0\"><style>img{object-fit: cover; overflow: hidden; max-width: 100%; width:100%; height: inherit !important; " +
                "" + "}</style></head>";
        return "<html>" + head + "<body>" + bodyHTML + "</body></html>";
    }

}
