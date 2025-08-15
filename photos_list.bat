@echo off
setlocal enabledelayedexpansion

:: === Use the folder where the script is located as parent ===
set "PARENT=%~dp0"
set "OUTPUT=photos_list.txt"

:: Go to parent folder
pushd "%PARENT%" || (echo Parent folder not found & exit /b)

:: Remove old output file if exists
> "%OUTPUT%" echo.

set "prevfolder="

:: Search for image files
for /r %%F in (*.jpg *.jpeg *.png *.gif *.bmp *.tiff *.webp) do (
    set "fullpath=%%~dpF"
    set "relpath=%%~dpnxF"
    set "relpath=!relpath:%PARENT%=!"
    set "relpath=!relpath:\=/!"

    if /i "!fullpath!" neq "!prevfolder!" (
        if defined prevfolder echo.>>"%OUTPUT%"
        set "prevfolder=!fullpath!"
    )

    echo !relpath!>>"%OUTPUT%"
)

popd
echo Done! Output saved to "%PARENT%%OUTPUT%"
pause
