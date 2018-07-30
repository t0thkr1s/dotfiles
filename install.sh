#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip neofetch vlc deluge wget nikto nmap
	thunar nautilus timeshift firefox tor
	sqlitebrowser powerline terminator htop npm wireshark
	virtualbox xfce4-goodies bleachbit timeshift tor)

pip install powerline-gitstatus
npm install -g vtop

# burp suite commmunity edition
echo "[ info ] Downloading Burp Suite Community Edition..."
wget -O /tmp/burpsuite.sh "https://portswigger.net/burp/releases/download?product=community&type=linux"
echo "[ done ]Burp Suite downloaded!"



for package in "${packages[@]}"
do
	echo "[ info ] Installing package: $package"
	apt install $package -y &>/dev/null 
	echo "[ done ] $package installed!"
done

