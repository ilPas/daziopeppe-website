jQuery(document).ready(function(){
    "use strict";
    jQuery(".rating").rating();
    jQuery('.bg-image').each(function(){
        var thes = jQuery(this);
        var url = thes.attr("data-image");
        if(url){
            thes.css("background-image", "url(" + url + ")");
        }
    });
    /** Owl Carousel **/
    var owl = jQuery('#post-slider');
    owl.owlCarousel({
        stagePadding: 35,
        autoPlay: 1500,
        loop:true,
        center:true,
        margin:0,
        nav:false,
        dots:false,
        mouseDrag:false,
        pagination:false,
        //Basic Speeds
        slideSpeed : 1000,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            768:{
                items:2
            },
            1024:{
                items:5
            },
            1100:{
                items:6
            }
        }
    });
    jQuery(document).on('click', '#next_post', function(e){
        e.preventDefault();
        owl.trigger('next.owl');
        /** Append Slider Text **/
        append_sliderText();
    });
    jQuery(document).on('click', '#prev_post', function(e){
        e.preventDefault();
        owl.trigger('prev.owl');
        /** Append Slider Text **/
        append_sliderText();
    });
    // OnScreen Detect
    var jQueryappeared = jQuery('.detect');
    jQueryappeared.appear();
    jQuery(document.body).on('appear', '.detect', function(e, jQueryaffected) {
        // This code is executed for each appeared element
        jQueryaffected.each(function() {
            var thes = jQuery(this);
            var numbr = thes.text();
            thes.removeClass('detect');
            thes.prop('number', 0).animateNumber({
                number: numbr
            },5000);
        })
    });
    /** Date picker **/
    jQuery( ".datepicker" ).datepicker();
    /** Weather Widget **/
    var weather_div = jQuery("#weather");
    jQuery.simpleWeather({
        location: 'Paris, France',
        woeid: '',
        unit: 'f',
        success: function(weather) {
            var html = '<h2 class="color-blue"><i class="ion-ios-sunny-outline"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
            html += '<button class="btn btn-blue">'+weather.city+', '+weather.region+'</button>';
            html += '<button class="btn btn-blue currently">'+weather.currently+'</button>';
            html += '<button class="btn btn-blue">'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</button>';
            weather_div.html(html);
        },
        error: function(error) {
            weather_div.html('<p>'+error+'</p>');
        }
    });
    /** Vegas Slider 1 **/
    jQuery('#vegas').vegas({
        delay: 20000,
        transitionDuration: 4000,
        slides: [
            { src: 'images/slider-2.jpg' },
            { src: 'images/slider-1.jpg' }
        ],
        transition: 'zoomOut'
    });
    /** Vegas Slider 2 **/
    var veg2 = jQuery('#vegas-2');
    veg2.vegas({
        delay: 20000,
        transitionDuration: 4000,
        slides: [
            { src: 'images/slider-2.jpg' },
            { src: 'images/slider-3.jpg' }
        ],
        transition: 'zoomOut'
    });
    jQuery(document).on('click', '#vegas_prev', function(e){
        e.preventDefault();
        veg2.vegas('previous');
    });
    jQuery(document).on('click', '#vegas_next', function(e){
        e.preventDefault();
        veg2.vegas('next');
    });
    /** Vegas Slider 3 **/
    jQuery('#vegas-video').vegas({
        slides: [
            {src: 'images/slider-3.jpg',
                video: {
                    src: [
                        'images/videos/bg-video.mp4'
                    ],
                    loop: true,
                    mute: true
                }
            }
        ]
    });
    /** Swipe Gallery **/
    jQuery('.swipebox').swipebox();
    /** Add shadow on nav **/
    jQuery(window).on('scroll', function(){
        var head_class = jQuery('.header_style1 .navbar');
        if (jQuery(window).scrollTop() > 10) {
            head_class.addClass('box-shadow');
        } else {
            head_class.removeClass('box-shadow');
        }
    });
    /** Waypoint For Navigation **/
    var sticky = new Waypoint.Sticky({
        element: jQuery('#scroll_head')[0]
    });
    /** jQuery for page scrolling feature **/
    jQuery(document).on("click", ".page-scroll a", function(){
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            var target = jQuery(this.hash);
            target = target.length ? target : jQuery('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                jQuery('#navbar .navbar-nav li a').removeClass('active');
                target.addClass('active');
                jQuery('html,body').animate({
                    scrollTop: target.offset().top - 80
                }, 1500,'easeInOutExpo');
                return false;
            }
        }
    });
    /** Menu Dropdown On Hover **/
    var find_drop_content = '.dropdown-content';
    jQuery(document).on('mouseenter','ul.nav li.dropdown', function () {
        jQuery(this).find(find_drop_content).stop(true, true).slideDown();
    }).on('mouseleave','ul.nav li.dropdown',  function(){
        jQuery(this).find(find_drop_content).stop(true, true).slideUp();
    });
    /** Custom Contact Form **/
        // Contact Form
    jQuery("#submit_form").on('click', function(e) {
        e.preventDefault();
        var Name = jQuery('#name').val();
        var Email = jQuery('#email').val();
        var Phone = jQuery('#phone').val();
        var subject = jQuery('#subject').val();
        var message = jQuery('#message').val();
        if(Name == ''){
            jQuery('.name').css('border-color','red');
        } else if(Email == '') {
            jQuery('.email').css('border-color','red');
        } else if(Phone == ''){
            jQuery('.phone').css('border-color','red');
        } else if(subject == ''){
            jQuery('.subject').css('border-color','red');
        } else if(message == ''){
            jQuery('.message').css('border-color','red');
        } else {
            jQuery.ajax({
                url : "http://html.webcure.me/alpine/files/contact.php",
                type : "POST",
                data : {
                    'userName' : Name,
                    'userEmail' : Email,
                    'userPhone' : Phone,
                    'usersubject' : subject,
                    'userMessage' : message
                },
                success : function(data){
                    if(data.length != ''){
                        jQuery('#result_contact').html(data);
                        jQuery('#name,#email, #phone, #subject ,#message').val('');
                        jQuery('#submit').html('<i class="fa fa-paper-plane"></i> Submit');
                    }
                },
                beforeSend : function() {
                    jQuery('#submit_form').html('<i class="fa fa-refresh fa-spin"></i> Submitting..');
                },
                error: function() {
                    //jQuery('.contact_submit').html('<i class="fa fa-paper-plane"></i> Send Message');
                }
            });
        }
    })
});
function remove_add_class_owl(){
    jQuery('#post-slider .owl-item').removeClass('main_slide_hov');
    jQuery('#post-slider').find('.owl-item.center').prev().prev().addClass('main_slide_hov');
}
jQuery(window).load(function() {
    jQuery('#preloader').fadeOut('slow');
    /** For Post slider **/
    remove_add_class_owl();
    append_sliderText();
});
function append_sliderText(){
    var appendDiv = jQuery('#append_slider_text');
    remove_add_class_owl();
    var data = jQuery('#post-slider').find('.owl-item.main_slide_hov').find('.postSlider-copy').html();
    appendDiv.empty();
    appendDiv.append(data);
}
