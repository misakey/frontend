import os
import time
import sys
import subprocess
from pathlib import Path

# To provide via environment variable
MK_DATA_PROTOTYPE_LOCATION = (os.environ.get('MK_DATA_PROTOTYPE_LOCATION', None)
                              or '/home/cedricvr/repos/pocs/mk-data-prototype')
MK_DATA_PROTOTYPE_LOCATION = Path(MK_DATA_PROTOTYPE_LOCATION).expanduser()

class ServerDidNotStartProperlyException(Exception):
    pass

try:
    with open('/tmp/mk-data-prototype-server.stdout.log', 'w') as stdout_logfile, \
         open('/tmp/mk-data-prototype-server.stderr.log', 'w') as stderr_logfile:
        server_proc = subprocess.Popen(
            # without option "-u", "print" calls are not written to log files
            'python3 -u http_api/server.py'.split(),
            cwd=MK_DATA_PROTOTYPE_LOCATION/'src',
            stdout=stdout_logfile,
            stderr=stderr_logfile
        )
        time.sleep(0.5)

        if server_proc.poll():
            raise ServerDidNotStartProperlyException

        subprocess.run(f'yarn test:integration {sys.argv[1]}', shell=True)

        server_proc.terminate()
except ServerDidNotStartProperlyException:
    with open('/tmp/mk-data-prototype-server.stderr.log') as stderr_logfile:
        print('ERROR: Server did not start properly.')
        print(stderr_logfile.read())
