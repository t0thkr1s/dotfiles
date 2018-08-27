#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip python3-pip neofetch vlc deluge wget nikto nmap i3
	thunar nautilus firefox ranger adapta-gtk-theme lxappearance
	adapta-backgrounds papirus-icon-theme openjdk-11-jdk neovim fortune
	sqlitebrowser terminator htop wireshark lolcat toilet cowsay git
	virtualbox bleachbit timeshift tor tlp preload)

add-apt-repository ppa:tista/adapta
add-apt-repository ppa:papirus/papirus

apt update -y &>/dev/null
apt full-upgrade -y &>/dev/null


# Installing packages
for package in "${packages[@]}"
do
	echo "[ info ] Installing package: $package"
	apt install $package -y &>/dev/null
	echo "[ done ] $package installed!"
done

# Install pywal
pip3 install pywal

# Downloading and installing gotop
echo "[ info ] Downloading gotop..."
git clone --depth 1 https://github.com/cjbassi/gotop /tmp/gotop
/tmp/gotop/scripts/download.sh
cp gotop /usr/bin/
echo "[ done ] gotop is ready to use!"

# Downloading Burp suite commmunity edition
echo "[ info ] Downloading Burp Suite Community Edition..."
wget -O /tmp/burpsuite.sh "https://portswigger.net/burp/releases/download?product=community&type=linux"
echo "[ done ]Burp Suite downloaded!"

# Start Burp Suite installer
chmod +x /tmp/burpsuite.sh
/tmp/burpsuite.sh

# Install Spotify, Discord, Sublime Text via Snap
snap install spotify
snap install discord
snap install sublime-text

# Adding non-root user to th wireshark group
usermod -aG wireshark $USER

# Start tlp
tlp start

# Copies directories into .config directory
cp -fR neofetch deluge vis htop terminator sublime-text-3 i3 polybar nvim ranger rofi $HOME/.config
cp compton.conf $HOME/.config
# Replaces the .bashrc file
cp -f .bashrc $HOME
# Replaces the hosts file
cp -f hosts /etc/hosts
# Replaces .gitconfig
cp -f .gitconfig $HOME

# Cleaning up
trash /tmp/gotop
trash /tmp/burpsuite.sh
apt autoremove
apt autoclean
