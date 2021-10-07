from PIL import Image
import numpy as np
import json
import re


def create_picture(picture):
    size = picture['size']

    body = picture_body_to_json(picture['body'])

    matrix = convert_rgb_matr_to_dec_matr(body)
    matrix = np.array(matrix, dtype=np.uint8)

    picture = Image.fromarray(matrix, 'RGB')
    
    return picture

def picture_body_to_json(picture_body):
    body_json = "{" + "\"body\": " + str(picture_body).replace("\'", '"') + "}"
    return json.loads(body_json)['body']

def convert_rgb_matr_to_dec_matr(rgb_matrix):
    matrix = []
    for row in rgb_matrix:
        line = []
        
        for pixel in row:
            if pixel == '':
               pixel = [255, 255, 255]
            else:
                pixel = re.findall('[0-9]+', pixel)
            line.append(pixel)
        matrix.append(line)
    
    return matrix