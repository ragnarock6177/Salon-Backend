import admin from 'firebase-admin'
import fs from 'fs';
const serviceAccount = {
  "type": "service_account",
  "project_id": "quick-chat-84767",
  "private_key_id": "c06042a82f0fbc19c368c9a70af87ea82bebb95f",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC98Z7UuEsxVVA2\niUAvIQfyAJV6fLQPQfpBvmgqfdNC59ReWed4iUGcEcp90XdHGinLP7Tj+sYju1wk\nDW0urora1c5YDUepJs2cpDZl8mIJ4+sxxXBSon2Wb1FxnkU+7MSFoWB8bOdyuIL8\nwwSyoipmLHnbyQ8PtvrlnC5aPO3lv4fbS4+ud5G+llIfduIftzxSHk6qfbc8M9NX\npDrVE0xGgeG7EHfgj1aRD5icLr1ZVmpY7IF699iHm/o6n1MMxmEWxKVfRsXOP4ju\nF2Rp3489HXtJfmEs6keQnQoqKExUKKP5b3gkQH8aUW21LH36UoOyXTjjM7rPeNpa\nXJ3YN//DAgMBAAECggEAI0Hnbqrq4jRo2Eav0E+8TtKG7J6bOb3Qe0Whxklm3qNz\nyzO7AKfRsuumf6ZTErKrkVu48xyIjPdpShPn8WNayPYpADUu2Ronzmy44EGWqylQ\nbgOtLtmUoEj3gDSVu/FtJTToWRBKAgR34/07MQFjB2Y4FHEEx7D6b4aHIB7xNdT+\nBlYV/1msr+Zvo+o3WiTq7WraC0vAwsGlELQ//W0EPdzYFt8De2YulIlPJEwKfj9F\nSvx2+Li+qeiW0BeiXY9z5AtRZbH8UUgcBrG/LVjQnhSHyo/z4LV8MLZakyOsEnxx\noHLwDqa9ffXjXCjTI06K2lz9fNQpX2cmrEVa2EgbyQKBgQD772/li8B03kWRRKhW\n0kjDeOl/ISlDRCJjkltjzG5m1nFkudZErmnQJ7xsGjSnBDpW8hqTfjbWQGANExIS\n1klcoqGuRJ3f15FWRKBM+3YYOCTrdzhdGgHe+ytcZPiz4O82+bz27cl4DZ/EVcOf\n4gsr4bZCBv4TEyrWQa0dqaqeTQKBgQDBAiQs1KDDZ/u+zloPY0/Ec9IwW0+cmB69\neoz8oAjMi5aPfMY9f63+5OXAf0zrtlveqPdjiPnXL/8H7dxd1rMyNr81HtbmcSW+\nBPK6RIN53NDgJPCMC87yiz9Qg5YuMhp3u8bHzYs/bsWgJ4izajWpqDV/kND/ZJUZ\n2NZomWS+TwKBgQCTwCmMorg9EfoUpwJe4LaBxRCTWTxc0cGlSblFPyhkMVGRNBfA\ncdVmmVc8wuWsKaOZSCVj6Lp6TojGQi/wUjH2HP7bOCyqkT8QK/EjFLp+m7azTVkF\n6PG99unIJwNgYwOH51D2NCBawwq212GCC8xncNk1weoR/8S4oQ3I/q8sZQKBgGfl\nzjFv2Ia4IBWLoYFtFZCMRJaRYN7MKKgZI3IOeA4cClV9dn2+kJyI/YDNRkwQ442N\n6XZkUxHanW/YRGsjW11piS6ARnDQcd/DbCKHJTthefNfDzpkVOfNu6yM2ThO8l6H\n76643/+qkqnu/jCOuQp2KS5dd5QzweujBXBTOp8TAoGADW4fSTpUe4z7KuJexs7w\njw2GrnorXCDFRNST5Uj4cQA5o0m6f7bnrGHwHgHONH7vHg1mTi6EI6+N8ZSzRUGJ\nIWiLyxOIEOSE4jx0DhI/IN4Mp6AaUlMNYjw6AynjJ2yV4Nrj5Xqbd5MudlblJBF3\nm4mjWKVsSNJRDlHRrO/QpBI=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@quick-chat-84767.iam.gserviceaccount.com",
  "client_id": "110487274331155535709",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40quick-chat-84767.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

export default admin;
