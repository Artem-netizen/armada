let headerMenu = document.querySelector('.header')

if (window.screen.width > 575) {
    window.addEventListener('scroll', ()=> {
        if (window.pageYOffset > 150) {
            headerMenu.classList.add('active')
        } else {
            headerMenu.classList.remove('active')
        }
    })
}

// document.addEventListener('DOMContentLoaded', function() {
//     let elms = document.querySelectorAll('.slider');
//     for (let i = 0, len = elms.length; i < len; i++) {
//         // инициализация elms[i] в качестве слайдера
//         new ChiefSlider(elms[i]);
//     }
// });

window.addEventListener('click', (e) => {
})

    fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
          .then(data => {
              // console.log(data)
          })


/// img src

let mainSliderImg = document.querySelectorAll('.pass__slider_img')

mainSliderImg.forEach((item)=> {
    if (window.screen.width <= 575) {
        item.src = 'src/images/img/banner_main.png'
    } else {
        item.src = 'src/images/img/pass_slide_1.png'
    }

})



const arrayFilterButton = document.querySelectorAll('[data-filter]') || null
if ( arrayFilterButton !== null){
    arrayFilterButton.forEach(filter => {
        const filterInput = filter.querySelector('input')
        filterInput.addEventListener('change', () => {
            !filterInput.checked ? filter.classList.remove('active') : filter.classList.add('active')
            arrayFilterButton.forEach(item => {
                if (!item.querySelector('input').checked) item.classList.remove('active')
            })
        })
    })
}
const searchModal = document.querySelector('.search-modal')
const searchModalButtons = document.querySelectorAll('[data-modal-search]')
searchModalButtons.forEach(searchModalButton => {
    searchModalButton.addEventListener('click', function () {
        searchModal.classList.add('active')

        // window.addEventListener('click', function (event) {
        //     console.log(event.target)
        //     if (event.target !== searchModal && event.target !== searchModalButton) {
        //         searchModal.classList.remove('active')
        //     }
        // })


    })
})



// / modile drop menu

document.querySelector('.header__mobile_burger-wrapper').addEventListener('click', ()=> {
    // document.querySelector('body').style.overflow = 'hidden'
    document.querySelector('.header__drop').style.height = '100vh'
    document.body.style.cssText = 'overflow: hidden'
    document.querySelector('.header__mobile_burger-wrapper').style.display = 'none'
    document.querySelector('.header__mobile_burger-close').style.display = 'block'
    document.querySelector('.header__drop_wrapper').style.display = 'flex'
    setTimeout(()=> {
        document.querySelector('.header__drop_wrapper_block').style.left = '0'
    }, 100)
})

document.querySelector('.header__mobile_burger-close').addEventListener('click', ()=> {
    // document.querySelector('body').style.overflow = 'auto'
    document.body.style.cssText = ''
    document.querySelector('.header__mobile_burger-wrapper').style.display = 'block'
    document.querySelector('.header__mobile_burger-close').style.display = 'none'
    document.querySelector('.header__drop_wrapper_block').style.left = '-500px'
    document.querySelector('.header__drop_wrapper_next').style.right = '-500px'
    setTimeout(()=> {
        document.querySelector('.header__drop_wrapper').style.display = 'none'
        document.querySelector('.header__drop_wrapper_next').style.display = 'none'
        document.querySelector('.header__drop').style.height = '0'
    }, 400)
})



document.querySelector('#shops').addEventListener('click', ()=> {
    document.querySelector('.header__drop_wrapper_block').style.left = '-500px'
    document.querySelector('.header__drop_wrapper_next').style.display = 'flex'
    setTimeout(()=> {
        document.querySelector('.header__drop_wrapper_next').style.right = '0'
    }, 100)

})

document.querySelector('.header__drop_wrapper_next-back').addEventListener('click', ()=> {
    document.querySelector('.header__drop_wrapper_block').style.left = '0'
    document.querySelector('.header__drop_wrapper_next').style.right = '-500px'
    setTimeout(()=> {
        document.querySelector('.header__drop_wrapper').style.display = 'flex'
        document.querySelector('.header__drop_wrapper_next').style.display = 'none'
        document.querySelector('.header__drop_wrapper_block').style.left = '0'
    }, 400)

})






