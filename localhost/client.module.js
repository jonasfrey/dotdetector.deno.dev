
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html_from_o_js,
    f_o_proxified_and_add_listeners,
    f_o_js_a_o_toast,
    f_o_toast,
    o_state_a_o_toast,
    s_css_a_o_toast
} from "https://deno.land/x/handyhelpers@5.3.7/mod.js"


// import { Boolean } from '/three.js-r126/examples/jsm/math/BooleanOperation.js';
// import { STLExporter } from '/three/STLExporter.js';
// if you need more addons/examples download from here...
//  
let s_id_error_msg = 'error_msg'
o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
    }
    #${s_id_error_msg}{
        position: absolute;
        width: 100%;
        top: 0;
        background: #f5c0c099;
        color: #5e0505;
        padding: 1rem;
        z-index: 111;
    }
    .no-drag {
        -webkit-user-drag: none;
        user-drag: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    ${s_css_a_o_toast}
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    .inputs{
        position:fixed;
        top: 0;
        right: 0;
        width: 20%;
        height: 100%;
        background: rgba(22,22,22,0.8);
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }
    label{
        width:100%;
        }
    .canvasses{
        width: 80%;
    }
    `
);

let f_update_canvas_timeout = function(){
    clearTimeout(o_state.n_id_timeout_update_canvas);
    o_state.n_id_timeout_update_canvas = setTimeout(()=>{
        f_update_canvas();
    }, o_state.n_ms_timeout_update_canvas)
}
let f_update_canvas = function(){

    let o_canvas = document.getElementById('canvas');
    if(!o_canvas){
        return
    }
    if(o_state.n_scl_x_pixel <= 1 || o_state.n_scl_y_pixel <= 1){
        return;
    }
    let o_canvas2 = document.getElementById('canvas2');
    // put url image to canvas 
    let o_ctx = o_canvas.getContext('2d');
    let o_ctx2 = o_canvas2.getContext('2d');

    if(o_state.s_dataurl_image != ''){
        let o_img = new Image();
        o_img.onload = function() {
            o_canvas.width = o_img.width;
            o_canvas.height = o_img.height;



            
            o_ctx.drawImage(o_img, 0, 0);

            let a_n_u8_image_data = o_ctx.getImageData(0, 0, o_canvas.width, o_canvas.height).data;


            o_state.n_pixels_x = Math.ceil(o_state.n_scl_x_crop / o_state.n_scl_x_pixel);
            o_state.n_pixels_y = Math.ceil(o_state.n_scl_y_crop / o_state.n_scl_y_pixel);
            o_canvas2.width = o_state.n_pixels_x;
            o_canvas2.height = o_state.n_pixels_y;
            o_ctx2.fillStyle = `rgba(255,255,255,1.0)`;
            o_ctx2.fillRect(0,0, o_canvas2.width, o_canvas2.height);

            a_o_pixel_black = [];
            for(let n_x = 0; n_x < o_state.n_pixels_x; n_x++){
                for(let n_y = 0; n_y < o_state.n_pixels_y; n_y++){
                    console.log('looping')
                    let n_trn_canvas_pixel_x_start =  o_state.n_trn_x_crop + n_x * o_state.n_scl_x_pixel;
                    let n_trn_canvas_pixel_y_start =  o_state.n_trn_y_crop + n_y * o_state.n_scl_y_pixel;
                    let n_trn_canvas_pixel_x_end =  n_trn_canvas_pixel_x_start + o_state.n_scl_x_pixel;
                    let n_trn_canvas_pixel_y_end =  n_trn_canvas_pixel_y_start + o_state.n_scl_y_pixel;
                    let n_sum_pixel = 0;
                    let n_count_pixel = 0;
                    // Get the pixel data
                    const a_n_u8_image_data_pixel = o_ctx.getImageData(
                        n_trn_canvas_pixel_x_start,
                        n_trn_canvas_pixel_y_start,
                        parseInt(o_state.n_scl_x_pixel),
                        parseInt(o_state.n_scl_y_pixel),
                    ).data;
                    // Calculate sum of all R, G, B, A values
                    let n_sum = 0;
                    for (let i = 0; i < a_n_u8_image_data_pixel.length; i++) {
                        n_sum += a_n_u8_image_data_pixel[i];
                    }
                    // Calculate average (each pixel has 4 values: R, G, B, A)
                    const n_avg_pixel = n_sum / a_n_u8_image_data_pixel.length;
                    let n_avg_pixel_normalized = n_avg_pixel / 255; // normalize to 0-1 range

                    if(n_avg_pixel_normalized < o_state.n_threshhold){
                        o_ctx.fillStyle = `rgba(0, 0, 0, 0.5)`; // darker color for higher values
                        o_ctx2.fillStyle = `rgba(0, 0, 0, 0.5)`; // darker color for higher values
                        a_o_pixel_black.push(
                            {
                                n_x: n_x,
                                n_y: n_y,
                            }
                        )
                    }else{
                        o_ctx.fillStyle = `rgba(0,0,0,0.0)`; // lighter color for lower values
                        o_ctx2.fillStyle = `rgba(0,0,0,0.0)`; // lighter color for lower values
                    }

                    o_ctx.strokeStyle = `rgba(255,0,0,0.5)`;
                    o_ctx.strokeRect(
                        n_trn_canvas_pixel_x_start, 
                        n_trn_canvas_pixel_y_start, 
                        o_state.n_scl_x_pixel, 
                        o_state.n_scl_y_pixel
                    );

                    o_ctx.fillRect(
                        n_trn_canvas_pixel_x_start, 
                        n_trn_canvas_pixel_y_start, 
                        o_state.n_scl_x_pixel, 
                        o_state.n_scl_y_pixel
                    );

                    o_ctx2.fillRect(
                        n_x, 
                        n_y, 
                        1, 
                        1
                    );
                    // console.log('drawing rect', n_x, n_y, o_state.n_scl_x_pixel, o_state.n_scl_y_pixel)
                }
            }

            // o_ctx.strokeStyle = 'rgba(0,255,0,0.5)';
            // o_ctx.strokeRect(
            //     o_state.n_trn_x_crop, 
            //     o_state.n_trn_y_crop, 
            //     o_state.n_scl_x_crop, 
            //     o_state.n_scl_y_crop
            // );


        };
        o_img.src = o_state.s_dataurl_image;

        
    } else {
        o_canvas.width = 0;
        o_canvas.height = 0;
    }


}


let f_callback_beforevaluechange = function(a_s_path, v_old, v_new){
    // console.log('a_s_path')
    // console.log(a_s_path)
    // let s_path = a_s_path.join('.');
    // if(s_path == 'a_o_person.0.s_name'){
    //     console.log('name of first person will be changed')
    // }
}
let f_callback_aftervaluechange = function(a_s_path, v_old, v_new){
    // console.log('a_s_path')
    // console.log(a_s_path)
    // let s_path = a_s_path.join('.');
    // if(s_path == 'n_thickness'){
    //     f_update_rendering();
    // }
}


let o_div = document;
let o_blob_stl = null;
let a_o_license = await(await fetch('https://api.sketchfab.com/v3/licenses')).json()
let a_o_category = await(await(fetch('https://api.sketchfab.com/v3/categories'))).json()
let a_o_pixel_black= []; // we dont need a proxy of this large array
let o_state = f_o_proxified_and_add_listeners(
    {
        n_pixel_mouse_x_rel_to_canvas: 0, 
        n_pixel_mouse_y_rel_to_canvas: 0,
        n_scl_x_crop: 0, 
        n_scl_y_crop: 0,
        n_trn_x_crop: 0,
        n_trn_y_crop: 0,
        n_threshhold: 0.5,
        n_pixels_x: 0,
        n_pixels_y: 0,
        n_ms_timeout_update_canvas: 1000,
        n_id_timeout_update_canvas: null,
        b_mouse_down_left:false,
        b_mouse_down_middle:false,
        b_mouse_down_right:false,
        n_trn_x_mouse_down: 0,
        n_trn_y_mouse_down: 0,
        n_trn_x_mouse_move: 0,
        n_trn_y_mouse_move: 0,
        n_scl_x_pixel: 10, 
        n_scl_y_pixel: 10, 
        n_percentage_image_width: 200,
        s_dataurl_image: '',
        ...o_state_a_o_toast,
    }, 
    f_callback_beforevaluechange,
    f_callback_aftervaluechange, 
    o_div
)

globalThis.o_state = o_state

let f_sleep_ms = async function(n_ms){
    return new Promise((f_res, f_rej)=>{
        setTimeout(()=>{
            return f_res(true)
        },n_ms)
    })
}

let f_add_tag = function(){
    if(o_state.s_tag != '' && !o_state.a_s_tag.find(s=>{return s == o_state.s_tag})){
        o_state.a_s_tag.push(o_state.s_tag)
        o_state.s_tag = ''
    }
}


globalThis.f_o_toast = f_o_toast
let o_el_svg = null;
// then we build the html
f_o_toast('this is info', 'info', 5000)
f_o_toast('this is warning','warning', 5000)
f_o_toast('this is error','error', 5000)
f_o_toast('this will take a while','loading', 5000)


let o = await f_o_html_from_o_js(
    {
        class: "test",
        style: "display: flex;flex-direction: row;",
        f_a_o: ()=>{
            return [
                {
                    class: "inputs", 
                    f_a_o: ()=>{
                        return [
                            {
                                s_tag: 'label', 
                                innerText:  `
                                left click and drag: crop the image
                                middle click: move the crop, 
                                right click: reset the crop
                                `
                            },
                            {
                                s_tag: "label", 
                                innerText: "Scale X in pixel: ",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_scl_x_pixel',
                                step: 0.5,
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "Scale Y in pixel: ",
                            },
                            {
                                step: 0.5,
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_scl_y_pixel',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "threshhold ",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                step: 0.01,
                                min: 0,
                                max: 1,
                                a_s_prop_sync: 'n_threshhold',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "n_scl_x_crop",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_scl_x_crop',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "n_scl_y_crop",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_scl_y_crop',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "n_trn_x_crop",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_trn_x_crop',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "n_trn_y_crop",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_trn_y_crop',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                        

     
                            {
                                s_tag: "input",
                                type: 'file',
                                accept: 'image/*',
                                onchange: async function(o_event){
                                    let o_file = o_event.target.files[0];
                                    if(o_file){
                                        let o_reader = new FileReader();
                                        o_reader.onload = function(e) {
            
                                            let s_dataurl_image = e.target.result;
                                            console.log(s_dataurl_image)
                                            o_state.s_dataurl_image = s_dataurl_image;

                                            let o_img = new Image();
                                            o_img.onload = function() {
    
                                                o_state.n_scl_x_crop = o_img.width;
                                                o_state.n_scl_y_crop = o_img.height;
                                                o_state.n_trn_x_crop = 0;
                                                o_state.n_trn_y_crop = 0;
                                                f_update_canvas_timeout();
                                            };
                                            o_img.src = o_state.s_dataurl_image;
                                        };
                                        o_reader.readAsDataURL(o_file);
                                    }
                                }
                            }, 
                            {
                                s_tag: "button",
                                innerText: 'export json',
                                onclick: async function(o_event){
                                    let o_json = {
                                        // n_scl_x_pixel: o_state.n_scl_x_pixel,
                                        // n_scl_y_pixel: o_state.n_scl_y_pixel,
                                        // s_dataurl_image: o_state.s_dataurl_image,
                                        n_pixels_x: o_state.n_pixels_x,
                                        n_pixels_y: o_state.n_pixels_y,
                                        a_o_pixel_black: a_o_pixel_black,
                                    }
                                    let s_json = JSON.stringify(o_json, null, 4);
                                    let o_blob = new Blob([s_json], {type: 'application/json'});
                                    let o_url = URL.createObjectURL(o_blob);
                                    let o_a = document.createElement('a');
                                    o_a.href = o_url;
                                    o_a.download = 'cross_stitch_pattern.json';
                                    document.body.appendChild(o_a);
                                    o_a.click();
                                    document.body.removeChild(o_a);
                                    URL.revokeObjectURL(o_url);
                                }

                            }
                        ]
                    }
                },
                
                {
                    a_s_prop_sync: 's_dataurl_image', 
                    s_tag: "img", 
                    class: "no-drag",

                    f_s_style: ()=>{
                        return [
                            'display: none',
                            'object-fit: contain',
                            `width: ${o_state.n_percentage_image_width}%`,
                            `border: 1px solid red`,
                        ].join(';')
                    },
                    f_s_src: ()=>{return o_state.s_dataurl_image},
                    
                }, 
                {
                    a_s_prop_sync: ['n_trn_x_mouse_move', 'n_trn_y_mouse_move'],
                    s_tag: "div",
                    f_s_style: ()=>{
                        console.log('f_s_style called')

                        return [
                            'position: fixed',
                            `top: ${o_state.n_trn_y_mouse_down}px`,
                            `left: ${o_state.n_trn_x_mouse_down}px`,
                            `width: ${o_state.n_scl_x_pixel}px`,
                            `height: ${o_state.n_scl_y_pixel}px`,
                            `border: 1px solid red`,
                        ].join(';')
                    }
                }, 
                {
                    
                    class: "canvasses",
                    style: "position:relative",
                    f_a_o: ()=>{
                        return [
                            {
                                s_tag: "canvas", 
                                id: 'canvas',
                                oncontextmenu: (e)=>{
                                    e.preventDefault();
                                },
                                onmousedown:(o_event)=>{
                                    // Get the canvas element
                                    let canvas = o_event.target;

                                        // Check which mouse button was pressed
                                    if(o_event.button == 0){o_state.b_mouse_down_left = true;} 
                                    if(o_event.button == 1){o_state.b_mouse_down_middle = true;} 
                                    if(o_event.button == 2){o_state.b_mouse_down_right = true;} 
                                    if(o_state.b_mouse_down_right){
                                        o_state.n_trn_x_crop = 0; 
                                        o_state.n_trn_y_crop = 0;
                                        o_state.n_scl_x_crop = canvas.width; 
                                        o_state.n_scl_y_crop = canvas.height; 
                                        f_update_canvas();
                                        return;
                                    }

                                    // Get the position of the canvas relative to the viewport
                                    let rect = canvas.getBoundingClientRect();
                                    
                                    // Calculate the mouse position relative to the canvas
                                    let n_pixel_mouse_x_rel_to_canvas = o_event.clientX - rect.left;
                                    let n_pixel_mouse_y_rel_to_canvas = o_event.clientY - rect.top;
                                    o_state.n_trn_x_crop = n_pixel_mouse_x_rel_to_canvas
                                    o_state.n_trn_y_crop = n_pixel_mouse_y_rel_to_canvas
                                }, 
                                onmousemove: (o_event)=>{
                                    // Get the canvas element
                                    let canvas = o_event.target;
                                    
                                    // Get the position of the canvas relative to the viewport
                                    let rect = canvas.getBoundingClientRect();
                                    // Calculate the mouse position relative to the canvas
                                    o_state.n_pixel_mouse_x_rel_to_canvas = o_event.clientX - rect.left;
                                    o_state.n_pixel_mouse_y_rel_to_canvas = o_event.clientY - rect.top;
                                    if(o_state.b_mouse_down_left){
                                        o_state.n_scl_x_crop = Math.abs(o_state.n_trn_x_crop-o_state.n_pixel_mouse_x_rel_to_canvas)
                                        o_state.n_scl_y_crop = Math.abs(o_state.n_trn_y_crop-o_state.n_pixel_mouse_y_rel_to_canvas)
                                    }
                                    if(o_state.b_mouse_down_middle){
                                        o_state.n_trn_x_crop = o_state.n_pixel_mouse_x_rel_to_canvas
                                        o_state.n_trn_y_crop = o_state.n_pixel_mouse_y_rel_to_canvas
                                    }
                                    
                                },
                            }, 
                            {
                                s_tag: "canvas", 
                                style: "min-width: 100px; image-rendering: pixelated;",
                                id: 'canvas2',
                            }, 
                            {
                                class: 'canvas_crop', 
                                a_s_prop_sync: [
                                    'n_trn_x_crop',
                                    'n_trn_y_crop',
                                    'n_scl_x_crop',
                                    'n_scl_y_crop',
                                ],
                                f_s_style: ()=>{
                                    return [
                                        `left: ${o_state.n_trn_x_crop}px`,
                                        `top: ${o_state.n_trn_y_crop}px`,
                                        `width: ${o_state.n_scl_x_crop}px`,
                                        `height: ${o_state.n_scl_y_crop}px`,
                                        `position:absolute`, 
                                        `border: 2px solid green`, 
                                        'pointer-events: none'
                                    ].join(';')
                                }
                            }, 
                            {
                                a_s_prop_sync: [
                                    'n_pixel_mouse_y_rel_to_canvas',
                                ],
                                f_s_style: ()=>{
                                    return [
                                        `left: 0`,
                                        `top: ${o_state.n_pixel_mouse_y_rel_to_canvas}px`,
                                        `width: 100%`,
                                        `height: 1px`,
                                        `position:absolute`, 
                                        `background: rgba(0,0,255,0.8)`, 
                                        'pointer-events: none'
                                    ].join(';')
                                }
                            },
                            {
                                a_s_prop_sync: [
                                    'n_pixel_mouse_x_rel_to_canvas',
                                ],
                                f_s_style: ()=>{
                                    return [
                                        `top: 0`,
                                        `left: ${o_state.n_pixel_mouse_x_rel_to_canvas}px`,
                                        `height: 100%`,
                                        `width: 1px`,
                                        `position:absolute`, 
                                        `background: rgba(0,0,255,0.8)`, 
                                        'pointer-events: none'
                                    ].join(';')
                                }
                            }
                        ]
                    }
                }
                
            ]
        }
    }, 
    o_state
)

window.onmouseup = function(o_event){
    if(o_event.button == 0){o_state.b_mouse_down_left = false;} 
    if(o_event.button == 1){o_state.b_mouse_down_middle = false;} 
    if(o_event.button == 2){o_state.b_mouse_down_right = false;} 
    f_update_canvas();
}
document.body.appendChild(o);
