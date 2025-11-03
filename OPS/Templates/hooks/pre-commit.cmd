@echo off
node tools\check_banned_terms.mjs
IF %ERRORLEVEL% NEQ 0 EXIT /B %ERRORLEVEL%
node tools\size_guard.mjs --all
IF %ERRORLEVEL% NEQ 0 EXIT /B %ERRORLEVEL%
