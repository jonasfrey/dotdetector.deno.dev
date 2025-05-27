pid_websersocket=$(pgrep -f "websersocket_3ea70768-e5b6-4a9c-bf46-855b6329340e.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd