"use strict"
const moreInfo = document.querySelector('.banner__info');
const bannerBody = document.querySelectorAll('.banner__body');
bannerBody.forEach((item) => {
    item.addEventListener('click', (e) => {
        if(e.target.closest('.banner__info')) {
            item.classList.toggle('opened');
            if (!e.target.closest('.banner__body').classList.contains('opened')) {
                item.nextElementSibling.style.height = null;
                console.log(e.target);
                    e.target.innerHTML = 'More info';
                    e.target.nextElementSibling.classList.remove('active');
            } else {
                item.nextElementSibling.style.height  = item.nextElementSibling.scrollHeight + 'px';
                console.log(e.target);
                e.target.innerHTML = 'Hide info';
                e.target.nextElementSibling.classList.add('active');
            }
        }
    })
})