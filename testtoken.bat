@echo off
@chcp 65001

if exist "%SystemRoot%\SysWOW64" path %path%;%windir%\SysNative;%SystemRoot%\SysWOW64;%~dp0

bcdedit >nul

if '%errorlevel%' NEQ '0' (goto UACPrompt) else (goto UACAdmin)
echo 请以管理员身份开始执行本程序
echo 按任意键继续
pause
:UACPrompt

%1 start "" mshta vbscript:createobject("shell.application").shellexecute("""%~0""","::",,"runas",1)(window.close)&exit

exit /B

:UACAdmin

cd /d "%~dp0"
node mian -key e0dfa4a4c1ad0887c74716087b7263a03cdd629175bd09eeb0d207d2cd6a4815
pause