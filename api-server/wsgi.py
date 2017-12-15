from main import create_app

# Entry point for uWSGI
port = int(os.environ.get("METAWAHL_PORT", 9000))
app = create_app()

if __name__ == "__main__":
    app.run(port=port)
