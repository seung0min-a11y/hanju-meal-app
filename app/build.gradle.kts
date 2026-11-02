plugins { id("com.android.application") }

android {
    namespace = "com.hanjumeal.offline"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.hanjumeal.offline"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "3.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
