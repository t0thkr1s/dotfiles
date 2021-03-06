call plug#begin()

" plugins
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'scrooloose/nerdtree'
Plug 'airblade/vim-gitgutter'
Plug 'wakatime/vim-wakatime'
Plug 'dylanaraps/wal.vim'

call plug#end()

""" enable syntax
syntax on

""" enable pywal color scheme
colorscheme wal

""" other configs
filetype plugin indent on
set tabstop=4 softtabstop=4 shiftwidth=4 expandtab smarttab autoindent
set incsearch ignorecase smartcase hlsearch
set encoding=utf-8
set title
set wildmenu
set number
set mouse=a
set nowrap

