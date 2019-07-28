set -euxo pipefail
sudo sed -i s/GRUB_TIMEOUT=0/GRUB_TIMEOUT=2/g /etc/default/grub
sudo update-grub

sudo add-apt-repository ppa:graphics-drivers


sudo apt update
sudo apt upgrade


sudo apt install xterm nvidia-390 -y

sudo nvidia-xconfig --cool-bits 4

echo "you should reboot and make sure nvidia-smi is working and then run part 2"
