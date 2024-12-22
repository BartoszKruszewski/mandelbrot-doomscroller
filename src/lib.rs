use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn draw_mandelbrot(
    center_x: f64,
    center_y: f64,
    scale: f64,
    width: u32,
    height: u32,
    max_iter: u32,
) -> Vec<u8> {
    let mut data = vec![0u8; (width * height * 4) as usize];

    for py in 0..height {
        for px in 0..width {
            let x0 = center_x + (px as f64 - width as f64 / 2.0) * scale;
            let y0 = center_y + (py as f64 - height as f64 / 2.0) * scale;

            let mut x = 0.0;
            let mut y = 0.0;
            let mut iter = 0;

            while x*x + y*y <= 4.0 && iter < max_iter {
                let x_temp = x*x - y*y + x0;
                y = 2.0 * x * y + y0;
                x = x_temp;
                iter += 1;
            }

            let idx = ((py * width + px) * 4) as usize;
            if iter < max_iter {
                let c = (255.0 * iter as f64 / max_iter as f64) as u8;
                data[idx + 0] = c;
                data[idx + 1] = c;
                data[idx + 2] = 255;
                data[idx + 3] = 255;
            } else {
                data[idx + 0] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
            }
        }
    }

    data
}
