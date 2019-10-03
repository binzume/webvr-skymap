@echo off
setlocal enabledelayedexpansion

set F=
for %%f in (icon_cursor icon_lines icon_grid icon_solar icon_config icon_exit) do (
  msdfgen.exe -svg %%f.svg -o %%f.png -size 64 64 -scale 1
  set F=!F! %%f.png
)

echo %F%
go run pack.go -o icons.png %F%
go run decode_msdf.go icons.png
