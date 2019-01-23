#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "This script needs to be run as root!"
  exit
fi

script_dir="$(dirname "$(realpath $0)")"

update_system(){
    apt update && apt full-upgrade -y
}

install_packages(){
    apt install -y python-pip python3-pip vlc transmission-gtk wget curl \
        nikto nmap thunar firefox ranger lxappearance arp-scan netdiscover default-jdk default-jre \
        neovim fortune lolcat snapd feh xxd dirb sqlitebrowser terminator htop wireshark lolcat \
        toilet cowsay git apktool bleachbit tor gdb gparted openvpn adb wifite hashcat zsh trash-cli \
        binwalk stegosuite sqlmap tmux rxvt-unicode rxvt-unicode-256color compton
}

install_adapta_dependencies(){
    apt install -y autoconf automake inkscape libgdk-pixbuf2.0-dev \
        libglib2.0-dev libxml2-utils pkg-config sassc parallel
}

install_i3gaps_dependencies(){
    apt install -y libxcb1-dev libxcb-keysyms1-dev libpango1.0-dev \
        libxcb-util0-dev libxcb-icccm4-dev libyajl-dev \
        libstartup-notification0-dev libxcb-randr0-dev \
        libev-dev libxcb-cursor-dev libxcb-xinerama0-dev \
        libxcb-xkb-dev libxkbcommon-dev libxkbcommon-x11-dev \
        autoconf libxcb-xrm0 libxcb-xrm-dev automake libxcb-shape0-dev
}

install_polybar_dependencies(){
    apt install build-essential git cmake cmake-data pkg-config libcairo2-dev \
        libxcb1-dev libxcb-util0-dev libxcb-randr0-dev libxcb-composite0-dev \ 
        python-xcbgen xcb-proto libxcb-image0-dev libxcb-ewmh-dev libxcb-icccm4-dev \
        libxcb-xkb-dev libxcb-xrm-dev libxcb-cursor-dev libasound2-dev libpulse-dev \
        i3-wm libjsoncpp-dev libmpdclient-dev libcurl4-openssl-dev libiw-dev libnl-genl-3-dev
}

remove_adapta_theme() {
    rm -rf /usr/share/themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
    rm -rf ~/.local/share/themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
    rm -rf ~/.themes/{Adapta,Adapta-Eta,Adapta-Nokto,Adapta-Nokto-Eta}
}

install_papirus_icons(){
    wget -qO- "https://raw.githubusercontent.com/PapirusDevelopmentTeam/papirus-icon-theme/master/install.sh" | DESTDIR="$HOME/.icons" sh
}

install_adapta_theme(){
    wget "https://github.com/adapta-project/adapta-gtk-theme/archive/3.95.0.1.zip" -O /tmp/adapta.zip
    unzip /tmp/adapta.zip
    /tmp/adapta-gtk-theme-3.95.0.1/autogen.sh --prefix=/usr && make && make install
}

install_i3gaps(){
    git clone https://www.github.com/Airblader/i3 /tmp/i3gaps
    cd /tmp/i3gaps
    autoreconf --force --install
    rm -rf build/
    mkdir -p build && cd build/
    ../configure --prefix=/usr --sysconfdir=/etc --disable-sanitizers
    make
    make install
    cd ${script_dir}
}

install_polybar(){
    git clone https://github.com/jaagr/polybar
    cd polybar
    mkdir build
    cd build
    cmake ..
    make -j$(nproc)
    make install
    cd ${script_dir}
}

install_breeze_cursor_theme(){
    rm -rf /usr/share/icons/Breeze-Adapta
    mkdir /usr/share/icons/Breeze-Adapta
    cp -R cursors/Breeze-Adapta/* /usr/share/icons/Breeze-Adapta
}

install_neofetch(){
    git clone https://github.com/dylanaraps/neofetch /tmp/neofetch
    cd /tmp/neofetch
    make install
    cd ${script_dir}
}

install_gotop(){
    git clone https://github.com/cjbassi/gotop /tmp/gotop
    /tmp/gotop/scripts/download.sh
    cp gotop /usr/bin/
}

install_burpsuite(){
    wget -O /tmp/burpsuite.sh "https://portswigger.net/burp/releases/download?product=community&type=linux"
    chmod +x /tmp/burpsuite.sh
    /tmp/burpsuite.sh
}

install_searchsploit(){
    git clone https://github.com/offensive-security/exploitdb.git /opt/exploitdb
    sed 's|path_array+=(.*)|path_array+=("/opt/exploitdb")|g' /opt/exploitdb/.searchsploit_rc > ~/.searchsploit_rc
    ln -sf /opt/exploitdb/searchsploit /usr/local/bin/searchsploit
}

install_chrome(){
    wget "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb" -O chrome.deb
    dpkg -i chrome.deb
}

install_atom(){
    wget "https://atom.io/download/deb" -O atom.deb
    dpkg -i atom.deb
    apt install -f
}

install_snaps(){
    snap install spotify
    snap install postman
    snap install termius-app
}

install_plug(){
    curl -fLo ~/.local/share/nvim/site/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
    chown -R $SUDO_USER:$SUDO_USER ~/.local/share/nvim/
}

copy_configs(){
    cp -fR neofetch transmission vis vlc polybar compton htop terminator i3 polybar nvim ranger rofi dunst ~/.config
    cp -f {.bashrc,.tmux.conf,.zshrc,.gitconfig,.Xdefaults} $HOME
    cp -fR wallpapers ~/Pictures
    cp -fR fonts /usr/share/fonts/truetype
}

change_shell(){
    chsh -s /bin/zsh $SUDO_USER
}

add_user_to_wireshark_group(){
    usermod -aG wireshark $SUDO_USER
}

clean_up(){
    apt autoremove && apt autoclean
    trash ${script_dir}
}

main(){
    update_system
    install_packages
    install_adapta_dependencies
    install_i3gaps_dependencies
    install_polybar_dependencies
    remove_adapta_theme
    install_papirus_icons
    install_adapta_theme
    install_breeze_cursor_theme
    install_i3gaps
    install_polybar
    install_neofetch
    install_gotop
    install_burpsuite
    install_searchsploit
    install_chrome
    install_atom
    install_snaps
    install_plug
    copy_configs
    add_user_to_wireshark_group
    change_shell
    clean_up
}

main

