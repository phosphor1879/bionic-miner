set -euxo pipefail

# get x16r miner
wget https://github.com/trexminer/T-Rex/releases/download/0.12.1/t-rex-0.12.1-linux-cuda9.1.tar.gz
mkdir t-rex
tar -zxvf t-rex-0.12.1-linux-cuda9.1.tar.gz -C t-rex

# You will want to powerlimit...
# sudo nvidia-smi -i 0 -pl 190
# sudo visudo
# username     ALL=(ALL) NOPASSWD:ALL

cat <<EOF > start.sh
#!/bin/bash

while true
do
$PWD/t-rex/t-rex -a x16r -o stratum+tcp://stratum.icemining.ca:3648 -u FPMz6eFy4fYn5B4y85GR52LWRjKXbavRde.$HOSTNAME -p c=PHL
sleep 5
done
EOF
chmod a+x start.sh

cat <<EOF > start-tmux.sh
#!/bin/bash
while true
do
tmux new-session -A -s miner '$PWD/start.sh'
sleep 5
done
EOF
chmod a+x start-tmux.sh

cat <<EOF > start-xterm.sh
#!/bin/bash
xterm -e $PWD/start-tmux.sh
EOF
chmod a+x start-xterm.sh

mkdir -p ~/.config/autostart
cat <<EOF > ~/.config/autostart/mining.desktop
[Desktop Entry]
Name=mining
Exec=$PWD/start-xterm.sh
Type=Application
EOF
