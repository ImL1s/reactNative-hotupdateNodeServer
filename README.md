# React Native Hotupdate Demo File Server

- [react native hotupdate demo client](https://github.com/ImL1s/reactNative-hotupdateDemo)
- [React Native增量升級方案](https://www.evernote.com/l/AsBqZ6a2HQNNpZfstXH80LL476589LE-KYw)


## 注意

- iOS&Android的VersionName必須使用一樣的命名(做熱更新檢查Native版本用)

## 使用

- 啟動server

        babel-node index.js


- diff指令 

        bsdiff bundle/0.1.0/android/index.android.bundle bundle/0.2.0/android/index.android.bundle patch/0.1.0/android/0.1.0-0.2.0.patch

- react-native 打包指令

        react-native bundle --platform android --dev false --entry-file index.js --bundle-output /Users/iml1s-macpro/Project/Node/PatchTesting/bundle/0.2.0/android/index.android.bundle --assets-dest /Users/iml1s-macpro/Project/Node/PatchTesting/bundle/0.2.0/android/