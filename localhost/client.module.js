
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
    o_ctx2.fillStyle = `rgba(255,255,255,1.0)`;
    o_ctx2.fillRect(0,0, o_canvas.width, o_canvas.height);
    if(o_state.s_dataurl_image != ''){
        let o_img = new Image();
        o_img.onload = function() {
            o_canvas.width = o_img.width;
            o_canvas.height = o_img.height;
            o_canvas2.width = o_img.width;
            o_canvas2.height = o_img.height;
            o_ctx.drawImage(o_img, 0, 0);

            let a_n_u8_image_data = o_ctx.getImageData(0, 0, o_canvas.width, o_canvas.height).data;

            o_state.n_pixels_x = o_canvas.width/ o_state.n_scl_x_pixel;
            o_state.n_pixels_y = o_canvas.height / o_state.n_scl_y_pixel;
            a_o_pixel_black = [];
            for(let n_x = 0; n_x < o_state.n_pixels_x; n_x++){
                for(let n_y = 0; n_y < o_state.n_pixels_y; n_y++){
                    let n_trn_canvas_pixel_x_start = n_x * o_state.n_scl_x_pixel;
                    let n_trn_canvas_pixel_y_start = n_y * o_state.n_scl_y_pixel;
                    let n_trn_canvas_pixel_x_end = n_trn_canvas_pixel_x_start + o_state.n_scl_x_pixel;
                    let n_trn_canvas_pixel_y_end = n_trn_canvas_pixel_y_start + o_state.n_scl_y_pixel;
                    let n_sum_pixel = 0;
                    for(let n_trn_canvas_pixel_x = n_trn_canvas_pixel_x_start; n_trn_canvas_pixel_x < n_trn_canvas_pixel_x_end; n_trn_canvas_pixel_x++){
                        for(let n_trn_canvas_pixel_y = n_trn_canvas_pixel_y_start; n_trn_canvas_pixel_y < n_trn_canvas_pixel_y_end; n_trn_canvas_pixel_y++){
                            let n_value_red = a_n_u8_image_data[(n_trn_canvas_pixel_y * o_canvas.width + n_trn_canvas_pixel_x) * 4 + 0];
                            let n_value_green = a_n_u8_image_data[(n_trn_canvas_pixel_y * o_canvas.width + n_trn_canvas_pixel_x) * 4 + 1];
                            let n_value_blue = a_n_u8_image_data[(n_trn_canvas_pixel_y * o_canvas.width + n_trn_canvas_pixel_x) * 4 + 2];
                            let n_value_alpha = a_n_u8_image_data[(n_trn_canvas_pixel_y * o_canvas.width + n_trn_canvas_pixel_x) * 4 + 3];
                            n_sum_pixel += (n_value_red + n_value_green + n_value_blue) / 3; // average color value
                        }
                    }
                    let n_avg_pixel = n_sum_pixel / (o_state.n_scl_x_pixel * o_state.n_scl_y_pixel);
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
                        n_x * o_state.n_scl_x_pixel, 
                        n_y * o_state.n_scl_y_pixel, 
                        o_state.n_scl_x_pixel, 
                        o_state.n_scl_y_pixel
                    );

                    o_ctx.fillRect(
                        n_x * o_state.n_scl_x_pixel, 
                        n_y * o_state.n_scl_y_pixel, 
                        o_state.n_scl_x_pixel, 
                        o_state.n_scl_y_pixel
                    );

                    o_ctx2.fillRect(
                        n_x * o_state.n_scl_x_pixel, 
                        n_y * o_state.n_scl_y_pixel, 
                        o_state.n_scl_x_pixel, 
                        o_state.n_scl_y_pixel
                    );
                    // console.log('drawing rect', n_x, n_y, o_state.n_scl_x_pixel, o_state.n_scl_y_pixel)
                }
            }
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
        n_threshhold: 0.5,
        n_pixels_x: 0,
        n_pixels_y: 0,
        n_ms_timeout_update_canvas: 1000,
        n_id_timeout_update_canvas: null,
        b_mouse_down: false, 
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
                                s_tag: "label", 
                                innerText: "Scale X in pixel: ",
                            },
                            {
                                s_tag: "input", 
                                type: "number", 
                                a_s_prop_sync: 'n_scl_x_pixel',
                                oninput: ()=>{
                                    f_update_canvas_timeout();
                                }
                            },
                            {
                                s_tag: "label", 
                                innerText: "Scale Y in pixel: ",
                            },
                            {
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
                                            f_update_canvas_timeout();
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
                    // onmousedown:(o_event)=>{
                    //     o_state.b_mouse_down = true;
                    //     o_state.n_trn_x_mouse_down = o_event.clientX;
                    //     o_state.n_trn_y_mouse_down = o_event.clientY;
                    // }, 

                    // onmousemove: (o_event)=>{
                    //     if(o_state.b_mouse_down){
                    //         console.log('onmousemove called')
                    //         o_state.n_trn_x_mouse_move = o_event.clientX;
                    //         o_state.n_trn_y_mouse_move = o_event.clientY;
                    //     }
                    //     o_state.n_scl_x_pixel = Math.abs(o_state.n_trn_x_mouse_move - o_state.n_trn_x_mouse_down);
                    //     o_state.n_scl_y_pixel = Math.abs(o_state.n_trn_y_mouse_move - o_state.n_trn_y_mouse_down);
                    // },
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
                    f_a_o: ()=>{
                        return [
                            {
                                s_tag: "canvas", 
                                id: 'canvas',
                            }, 
                            {
                                s_tag: "canvas", 
                                id: 'canvas2',
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
    o_state.b_mouse_down = false;
    f_update_canvas_timeout()

}
document.body.appendChild(o);
