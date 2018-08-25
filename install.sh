#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip python3-pip neofetch vlc deluge wget nikto nmap
	thunar nautilus firefox ranger adapta-gtk-theme lxappearance
	adapta-backgrounds papirus-icon-theme openjdk-11-jdk neovim fortune
	sqlitebrowser terminator htop npm wireshark lolcat toilet cowsay
	virtualbox xfce4-goodies bleachbit timeshift tor tlp preload)

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

# Install vtop via npm
npm install -g vtop

# Install pywal
pip install pywal

# Downloading Burp suite commmunity edition
echo "[ info ] Downloading Burp Suite Community Edition..."
wget -O /tmp/burpsuite.sh "https://portswigger.net/burp/releases/download?product=community&type=linux"
echo "[ done ]Burp Suite downloaded!"

# Start Burp Suite installer
sh /tmp/burpsuite.sh  

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
# Replaces the .bashrc file
cp -f .bashrc $HOME
# Replaces the hosts file
cp -f hosts /etc/hosts
# Replaces .gitconfig
cp -f .gitconfig $HOME

# Cleaning up
apt autoremove
apt autoclean
