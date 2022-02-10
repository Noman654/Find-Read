from flask import Flask, render_template, request, redirect , flash, session,url_for
from werkzeug.security import check_password_hash, generate_password_hash
from cs50 import SQL
from tempfile import mkdtemp
from collections import defaultdict
from functools import wraps
from flask_session import Session
import os 

app = Flask(__name__)
db = SQL("sqlite:///database.db")

uri = os.getenv("DATABASE_URL")
if uri.startswith("postgres://"):
    uri = uri.replace("postgres://", "postgresql://")
db = SQL(uri)

pgloader --no-ssl-cert-verification database.db "postgres://jepocghcdmoati:6c916f0e8e144c94fa263dea7ec515a9ada0dfa2a74c0ea56aac59e7402c2454@ec2-44-193-188-118.compute-1.amazonaws.com:5432/dcdaeicnlahl0d"?sslmode=require 
#pgloader --no-ssl-cert-verification finance.db URI?sslmode=require

# maake sure template are auto reload
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
# set session file
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# set user id into session dictionary
def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


# give me a apology or detaial about error
def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    return render_template("apology.html", top=code, bottom=escape(message)), code


@app.route('/',methods=["GET", "POST"])
def home():
    if request.method == 'POST':
        search =request.form.get('search')
        search ='%'+search+'%'
        shop = db.execute("select name,id,adress,image from shop where name LIKE ?",search)
    else:
        shop = db.execute("select name,id ,adress,image from shop")
    return render_template('home.html',shop = shop)



# ENTRY FOR NEW USER
@app.route('/register', methods=["GET", "POST"])
def register():
    if request.method == 'GET':
        return render_template("register.html")
    else:
        email = request.form.get('email');
        name = request.form.get('name')
        password = request.form.get('password')
        password = generate_password_hash(password)
        # check the email is present or not
        row = db.execute("select email from users where email = ?",email)
        if len(row) != 0 :
            return render_template("error.html",name = "email is already present")
        db.execute("insert into users(email, name, password) values(:email, :name ,:password)",email = email, name = name, password = password)
        row = db.execute("select id from users where email = ?",email)
        session["user_id"] = row[0]['id']
        flash(f"hello {name} you are successfully registered ")
        return redirect('/')

# CREATE A LOGIN INFO AND CHECK
@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        check= db.execute("select password from users where email = ?",email)
        if len(check) != 1 or not check_password_hash(check[0]['password'],password):
            return render_template('error.html',name = "invalid username ")
        row = db.execute("select id from users where email = ?",email)
        session["user_id"] = row[0]['id']
        flash("Successfully login ")
        return redirect('/')
    else :
        return render_template('login.html')

# def buy_sell books
@app.route("/buy-sell", methods=["GET", "POST"])
@login_required
def sell_buy():
    if request.method == 'GET':
        search = request.form.get('email')
        return render_template('buy-sell.html')

@app.route('/add',methods=["GET", "POST"])
def add_list():
    return render_template('add.html')

#for searching 
@app.route('/search')
def search():
    query = request.form.get('search')
    return render_template('shop_det.html')

@app.route('/book',methods=["GET", "POST"])
def books_list():
    return render_template('book1.html')
    

@app.route('/shop/<shopid>')
def stores(shopid):
    
    print(shopid,type(shopid))
    store = db.execute("select name,image from shop where id=?;",shopid)
    print(shopid)
    print(store[0]["name"])
    return render_template('shop_det.html',shop=store[0])
   
@app.route('/read/<id>')
def read(id):
    print(id)
    return render_template('books.html',bookid=id)

# for logout
@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

if __name__ == '__main__':
    app.run(debug=False,host='0.0.0.0')
