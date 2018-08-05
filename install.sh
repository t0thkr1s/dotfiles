#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip neofetch vlc deluge wget nikto nmap
	thunar nautilus firefox ranger adapta-gtk-theme
	adapta-backgrounds papirus-icon-theme openjdk-11-jdk
	sqlitebrowser terminator htop npm wireshark lolcat
	virtualbox xfce4-goodies bleachbit timeshift tor)

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

# Copies directories into .config directory
cp -fR neofetch deluge vis htop terminator sublime-text-3 $HOME/.config
# Replaces hosts and .bashrc file
cp -f hosts .bashrc $HOME

# Cleaning up
apt autoremove
apt autoclean