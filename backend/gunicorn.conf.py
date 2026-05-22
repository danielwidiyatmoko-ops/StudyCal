# Gunicorn configuration for Oracle Cloud deployment
# Run with: gunicorn -c gunicorn.conf.py run:app

bind        = "0.0.0.0:5000"
workers     = 2
worker_class = "sync"
timeout     = 120
keepalive   = 5
accesslog   = "-"       # log to stdout
errorlog    = "-"       # log to stdout
loglevel    = "info"
