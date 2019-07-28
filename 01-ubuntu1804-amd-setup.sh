set -euxo pipefail
sudo sed -i s/GRUB_TIMEOUT=0/GRUB_TIMEOUT=2/g /etc/default/grub
sudo update-grub

wget -qO - http://repo.radeon.com/rocm/apt/debian/rocm.gpg.key | sudo apt-key add -
echo 'deb [arch=amd64] http://repo.radeon.com/rocm/apt/debian/ xenial main' | sudo tee /etc/apt/sources.list.d/rocm.list

sudo apt update
sudo apt upgrade


sudo apt install ocl-icd-opencl-dev clinfo rocm-smi xterm -y
# Notes:
# https://gist.github.com/9bitbear/ed22baac9b59ae53bbee74ab9bff7150
DRIVER=amdgpu-pro-19.20-812932-ubuntu-18.04
wget --referer=http://support.amd.com https://drivers.amd.com/drivers/linux/$DRIVER.tar.xz
tar -Jxvf $DRIVER.tar.xz
cd $DRIVER
chmod u+x ./amdgpu-pro-install
sudo ./amdgpu-pro-install --opencl=legacy --headless -y
sudo usermod -a -G video $LOGNAME
sudo ln -s /opt/rocm/bin/rocm-smi /usr/local/bin/rocm-smi

# get x16r miner
wget https://github.com/andru-kun/wildrig-multi/releases/download/0.17.9/wildrig-multi-linux-0.17.9-beta.tar.gz
mkdir wildrig
tar -zxvf wildrig-multi-linux-0.17.9-beta.tar.gz -C wildrig

cat <<EOF > start.sh
#!/bin/bash

while true
do
$PWD/wildrig/wildrig-multi --algo x16r --opencl-threads auto --opencl-launch auto --url stratum+tcp://stratum.icemining.ca:3648 --user FPMz6eFy4fYn5B4y85GR52LWRjKXbavRde.$HOSTNAME --pass c=PHL
sleep 5
done
EOF
chmod a+x start.sh

cat <<EOF > start-xterm.sh
#!/bin/bash
xterm -e $PWD/start.sh
EOF
chmod a+x start-xterm.sh

mkdir -p ~/.config/autostart
cat <<EOF > ~/.config/autostart/mining.desktop
[Desktop Entry]
Name=mining
Exec=$PWD/start-xterm.sh
Type=Application
EOF
