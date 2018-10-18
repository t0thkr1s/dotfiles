#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip python3-pip neofetch vlc deluge wget nikto nmap i3
	thunar firefox ranger adapta-gtk-theme lxappearance compton arp-scan
	adapta-backgrounds papirus-icon-theme openjdk-11-jdk neovim fortune
	sqlitebrowser terminator htop wireshark lolcat toilet cowsay git
	virtualbox bleachbit timeshift tor tlp preload autoconf gdb gparted
	hashcat texlive-full trash-cli)

polybar_dependencies=(cmake cmake-data pkg-config libcairo2-dev libxcb1-dev
	libxcb-util0-dev libxcb-randr0-dev python-xcbgen xcb-proto libxcb-image0-dev
	libxcb-ewmh-dev libxcb-icccm4-dev libxcb-xkb-dev libxcb-xrm-dev libxcb-cursor-dev
	libasound2-dev libpulse-dev i3-wm libjsoncpp-dev libmpdclient-dev
	libcurl4-openssl-dev libcurlpp-dev libiw-dev libnl-3-dev)

add-apt-repository ppa:tista/adapta
add-apt-repository ppa:papirus/papirus

# Update and upgrade
apt update && apt full-upgrade -y

# Installing packages
for package in "${packages[@]}"
do
	echo "[ info ] Installing package: $package"
	apt install $package -y &>/dev/null
	echo "[ done ] $package installed!"
done

# Downloading and installing i3-gaps
git clone https://www.github.com/Airblader/i3 /tmp/i3-gaps
cd /tmp/i3-gaps
autoreconf --force --install
rm -rf  build/
mkdir -p build && cd build/
../configure --prefix=/usr --sysconfdir=/etc --disable-sanitizers
make
make install

# Installing polybar dependencies
echo "[ info ] Installing polybar dependencies..."
for dependency in "${polybar_dependencies[@]}"
do
	apt install $dependency -y &>/dev/null
done
echo "[ done ] Dependency installation for polybar finished!"

# Downloading and building polybar
git clone https://github.com/jaagr/polybar /tmp/polybar
/tmp/polybar/build.sh

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

# Download, verify and start Metasploit installer
wget https://downloads.metasploit.com/data/releases/metasploit-latest-linux-x64-installer.run && wget https://downloads.metasploit.com/data/releases/metasploit-latest-linux-x64-installer.run.sha1 && echo $(cat metasploit-latest-linux-x64-installer.run.sha1)'  'metasploit-latest-linux-x64-installer.run > metasploit-latest-linux-x64-installer.run.sha1 && shasum -c metasploit-latest-linux-x64-installer.run.sha1 && chmod +x ./metasploit-latest-linux-x64-installer.run && ./metasploit-latest-linux-x64-installer.run

# Install Spotify, Discord, Sublime Text, Postman via Snap
snap install spotify
snap install discord
snap install sublime-text
snap install postman

# Adding non-root user to th wireshark group
usermod -aG wireshark $USER

# Start tlp
tlp start

# Copies directories into .config directory
cp -fR neofetch deluge vis htop terminator sublime-text-3 i3 polybar nvim ranger rofi dunst $HOME/.config
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
