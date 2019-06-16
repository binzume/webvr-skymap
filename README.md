# [WIP] WebVR SkyMap

DEMO: https://binzume.github.io/webvr-skymap/


WebVRで星空を表示するやつです

![Celestial sphere](./data/sphere.png)

- WebVR対応ブラウザ + コントローラが必要です (Oculus Go/Questで動作確認)
- 太陽と月が表示されていますが，おおよその方角です(日食などは再現されません)
- 恒星のデータはヒッパルコス星表を使っています
  - https://heasarc.gsfc.nasa.gov/db-perl/W3Browse/w3table.pl?tablehead=name%3Dhipparcos&Action=More+Options
  - 上のサイトから6.5等級未満のものを取得しました
- 星座線は http://astronomy.webcrow.jp/hip/

## TODO

- 月の満ち欠け
- 星座名・星座境界
- 惑星の表示

# License

T.B.D.
