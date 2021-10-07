from logging import error
import re
import os

from flask import (
    Blueprint, app, flash, g, redirect, render_template, request, session, url_for, current_app, send_from_directory
)
from flask.json import jsonify

from werkzeug.exceptions import abort

from sketchr.auth import login_required

from sketchr.db import get_db

from . import utils

bp = Blueprint('main', __name__)


@bp.route('/')
def index():
    id = request.args.get("id")

    if id is not None:
        id = int(id)

        db = get_db()
        record = db.execute(
            'SELECT id, author_id '
            'FROM picture where id = (?) ',
            ((id),)
        ).fetchone()

        if record is None:
            error = "Incorrect id request"
            flash(error)
            return render_template('index.html')

        return render_template('index.html', record=record)

    return render_template('index.html')


@bp.route('/gallery')
def gallery():

    return render_template('gallery.html')


@bp.route('/get_gallery_records')
def get_gallery_records():
    
    db = get_db()
    pictures = db.execute(
        'SELECT p.id, title, body, created, size, author_id, username '
        'FROM picture as p JOIN user as u ON p.author_id = u.id '
        'ORDER BY title'
    ).fetchall()

    records = {'pictures': []}

    for picture in pictures:
        record = {}
        record['id'] = picture['id']
        record['username'] = picture['username']
        record['created'] = picture['created']
        record['title'] = picture['title']
        record['size'] = picture['size']
        record['body'] = picture['body']

        records['pictures'].append(record)   
    
    return records


@bp.route('/get_record', methods=['POST'])
def get_record():

    id = request.json['recordId']

    if id is None:
        return {'result': "Wrong id"}

    db = get_db()
    record = db.execute(
        'SELECT title, body, size '
        'FROM picture '
        'WHERE id = ?',
        (id, )
    ).fetchone()

    if record is None:
        return {'result': "Wrong id"}

    return {
        'title': record['title'],
        'size': record['size'],
        'body': record['body']
    }


@bp.route('/save', methods=['POST'])
def save():
    picture_data = request.json

    error = None
    title = picture_data['title']
    size = int(picture_data['size'])
    body = str(picture_data['body'])
    author_id = session.get('user_id')
    
    if error is None:
        db = get_db()
        db.execute(
            'INSERT INTO picture (author_id, title, size, body) '
            'VALUES (?, ?, ?, ?)',
            (author_id, title, size, body)
        )
        db.commit()
        print("Success")
        return {'result' : "Success"}

    flash(error)
    
    return render_template("index.html")


@bp.route('/delete', methods=['POST'])
def delete_record():
    id = request.json['id']
    db = get_db()
    db.execute(
        'DELETE FROM picture '
        'WHERE id = ?',
        (id,)
    )
    db.commit()

    return {'result': 'success'}


@bp.route('/download/<id>')
def download(id):
    db = get_db()    
    picture = db.execute(
        'SELECT title, body, size '
        'FROM picture '
        'WHERE id = ?',
        (id, )
    ).fetchone()

    if not picture:
        flash(f"Picture with id {id} not found")
        return redirect(url_for("index"))

    name = f"{picture['title']}.png"
    picture = utils.create_picture(picture)
    picture.save(os.path.join(current_app.config['UPLOAD_FOLDER'], name))
    send_from_directory
        
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], name, as_attachment=True)