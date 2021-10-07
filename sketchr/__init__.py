import os

from flask import Flask, render_template

def create_app():
    #create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY="dev",
        DATABASE=os.path.join(app.instance_path, "sketch.sqlite"),
        UPLOAD_FOLDER = os.path.join(app.instance_path, "pictures/")
    )

    #load the instance config, if it exists, when not testing
    app.config.from_pyfile('config.py', silent=True)
    
    
    #ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
        os.makedirs(app.instance_path + "/pictures/")
    except OSError:
        pass

    app.register_error_handler(404, page_not_found)

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import main
    app.register_blueprint(main.bp)
    app.add_url_rule('/', endpoint='index')

    return app

def page_not_found(e):
    return render_template('e404.html'), 404