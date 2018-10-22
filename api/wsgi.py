import os
from main import create_app

# Entry point for uWSGI
application = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("METAWAHL_PORT", 9000))
    app.run(port=port)
