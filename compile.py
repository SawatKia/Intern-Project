import os
import shutil
import subprocess
import htmlmin
import csscompressor
from rjsmin import jsmin
from datetime import datetime
import pytz

def minify_file(file_path, file_type, file_versionstamp_map = {}):
    if file_type == 'html':
        with open(file_path, 'r', encoding="utf-8") as file:
            file_content = file.read()
        
        # replace all references to *.ext with *.versionstamp.ext
        for before, after in file_versionstamp_map.items():
            file_content = file_content.replace(before, after)

        return htmlmin.minify(file_content, remove_comments=True, remove_empty_space=True), False
    elif file_type == 'css':
        with open(file_path, 'r', encoding="utf-8") as file:
            file_content = file.read()
        return csscompressor.compress(file_content), False
    elif file_type == 'js':
        with open(file_path, 'r', encoding="utf-8") as file:
            file_content = file.read()
        return jsmin(file_content), False
    else:
        with open(file_path, 'rb') as file:
            file_content = file.read()
        return file_content, True

def clear_directory(directory):
    for filename in os.listdir(directory):
        if filename.startswith('.') or filename == "CNAME":
            continue

        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path) or os.path.islink(file_path):
            os.unlink(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)

def pack_web_project(input_directory, output_directory, ignore_directories=[], ignore_files=[]):
    # generate datestamp version string for cache busting
    versionstamp = datetime.now(tz=pytz.utc).strftime("v%Y%m%d%H%M%S")
    other_files = []
    html_files = []
    for root, _, files in os.walk(input_directory):
        if any(ignore_directory in root for ignore_directory in ignore_directories):
            continue
        for file in files:
            if file in ignore_files:
                continue
            file_path = os.path.join(root, file)
            file_type = None

            if file.endswith('.html'):
                file_type = 'html'
                html_files.append((file_path, file_type))
                continue
            elif file.endswith('.css'):
                file_type = 'css'
            elif file.endswith('.js'):
                file_type = 'js'

            other_files.append((file_path, file_type))

        
    file_versionstamp_map = {}

    # minify other files
    for file_path, file_type in other_files:
        relative_path = os.path.relpath(file_path, input_directory)
        # replace *.ext with *.versionstamp.ext
        relative_path = os.path.splitext(relative_path)[0] + "." + versionstamp + os.path.splitext(relative_path)[1]
        output_path = os.path.join(output_directory, relative_path)

        file_versionstamp_map[os.path.basename(file_path)] = os.path.basename(output_path)

        minified_content, is_binary = minify_file(file_path, file_type)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        if is_binary:
            with open(output_path, 'wb') as output_file:
                output_file.write(minified_content)
        else:
            with open(output_path, 'w', encoding="utf-8") as output_file:
                output_file.write(minified_content)

    # now minify html files
    for file_path, file_type in html_files:
        relative_path = os.path.relpath(file_path, input_directory)
        output_path = os.path.join(output_directory, relative_path)

        minified_content, _ = minify_file(file_path, file_type, file_versionstamp_map)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding="utf-8") as output_file:
            output_file.write(minified_content)

    # copy the resources folder
    os.makedirs(os.path.join(output_directory, "resources"), exist_ok=True)
    shutil.copytree(os.path.join(input_directory, "resources"), os.path.join(output_directory, "resources"), dirs_exist_ok=True)

def build_react_app():
    try:
        # Define the path to the client directory
        client_dir = os.path.join('web', 'client')
        
        # Change the current working directory to the client directory
        os.chdir(client_dir)
        result = subprocess.run(['npm', 'i'], capture_output=True, text=True)
        print(f"<npm i> Standard Output:\n{result.stdout}")
        print(f"<npm i> Standard Errors:\n{result.stderr if result.stderr else 'None'}")

        # Run the npm build command
        result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)        
        print(f"<npm run build> Standard Output:\n{result.stdout}")
        print(f"<npm run build> Standard Errors:\n{result.stderr if result.stderr else 'None'}")
    except Exception as e:
        print(f"Error during React build: {e}")

if __name__ == '__main__':
    # output_directory = 'build'
    build_react_app()
    # os.makedirs(output_directory, exist_ok=True)
    # clear_directory(output_directory)
    # pack_web_project("web", output_directory, ["resources"], [".gitignore"])