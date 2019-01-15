#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

packages=(python-pip python3-pip neofetch vlc transmision-gtk wget nikto nmap i3
	thunar firefox ranger adapta-gtk-theme lxappearance arp-scan libxml2-utils inkscape
	curl default-jdk default-jre neovim fortune snapd feh xxd dirb libglib2.0-dev
	sqlitebrowser terminator htop wireshark lolcat toilet cowsay git libgdk-pixbuf2.0-dev
	bleachbit timeshift tor tlp preload automake autoconf gdb gparted
	hashcat zsh trash-cli binwalk stegosuite parallel sassc pkg-config)

# Delete previous adapta installation
rm -rf /usr/share/themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
rm -rf ~/.local/share/themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
rm -rf ~/.themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}

# Update and upgrade
apt update && apt full-upgrade -y

# Installing packages
for package in "${packages[@]}"
do
	echo "[ info ] Installing package: $package"
	apt install $package -y &>/dev/null
	echo "[ done ] $package installed!"
done

# Download and install Papirus icon theme
wget -qO- https://raw.githubusercontent.com/PapirusDevelopmentTeam/papirus-icon-theme/master/install.sh | DESTDIR="$HOME/.icons" sh

# Download specific Adapta theme release
wget "https://github.com/adapta-project/adapta-gtk-theme/archive/3.95.0.1.zip" -O /tmp/adapta.zip
# Extract the files
unzip /tmp/adapta.zip -d adapta
# Change directory and install the theme
cd /tmp/adapta/adapta-gtk-theme-3.95.0.1/ && ./autogen.sh --prefix=/usr && make && make install

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

# Install Spotify, Discord, Sublime Text, Postman via Snap
snap install spotify
snap install discord
snap install atom
snap install postman

# Adding non-root user to th wireshark group
usermod -aG wireshark $USER

# Start tlp
tlp start

# Install Plug for Neovim
curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs \
    https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim

# Copies directories into .config directory
cp -fR neofetch transmission vis htop terminator i3 polybar nvim ranger rofi dunst $HOME/.config
cp compton.conf $HOME/.config
cp -f .bashrc $HOME
cp -f .zshrc $HOME
cp -f .gitconfig $HOME

# Cleaning up
trash /tmp/gotop
trash /tmp/burpsuite.sh
apt autoremove
apt autoclean
