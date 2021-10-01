import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
import flask

from werkzeug.security import check_password_hash, generate_password_hash

from sketchr.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        error = None
        
        if not username:
            error = "Username is required"
        
        elif not password:
            error = "Password is required"

        if error is None:
            db = get_db()
            try:
                db.execute(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(password))
                )
                db.commit()
            except db.IntegrityError:
                error = f"User {username} already exist"
        
        if error is None:
            redirect(url_for('auth.login'))

        flash(error)

    return render_template("auth/register.html")


@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        error = None

        db = get_db()

        user = db.execute(
            "SELECT * FROM user WHERE username = ?", (username, )
        ).fetchone()

        if user is None:
            error = 'Incorrect username'
        elif not check_password_hash(user['password'], password):
            error = 'Wrong password'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('index'))

        flash(error)

    return render_template('auth/login.html')


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view