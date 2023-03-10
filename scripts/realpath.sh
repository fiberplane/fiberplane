#!/usr/bin/env bash

# Copied from https://github.com/morgant/realpath/blob/master/realpath

#
# realpath - Convert a relative path to an absolute path. Also verifies whether
#            path/file exists. For each path specified which exists, it prints
#            the full path to STDOUT and returns 0 if all paths exist on any
#            error or if any path doesn't exist.
#
# Based on http://www.linuxquestions.org/questions/programming-9/bash-script-return-full-path-and-filename-680368/page2.html#post4239549
#
# CHANGE LOG:
#
# v0.1   2012-02-18 - Morgan Aldridge <morgant@makkintosshu.com>
#                     Initial version.
# v0.2   2012-03-26 - Morgan Aldridge
#                     Fixes to incorrect absolute paths output for '/' and any
#                     file or directory which is an immediate child of '/' (when
#                     input as an absolute path).
# v0.3   2012-11-29 - Morgan Aldridge
#                     Fix for infinite loop in usage option and local paths
#                     incorrectly assumed to be in root directory.
# v0.4   2014-04-05 - Morgan Aldridge
#                     Increased compatibility by matching GNU realpath output
#                     for relative paths. (Thanks to https://github.com/jlsantiago0)
# v0.4.1 2019-09-14 - Morgan Aldridge
#                     Better *nix compatibility (tested OpenBSD).
# v0.5   2019-09-15 - Morgan Aldridge
#                     Fix for invalid paths outputting root path.
#
# LICENSE:
#
# Copyright (c) 2012-2019, Morgan T. Aldridge. All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# - Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.
# - Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

# print usage instructions (help)
function usage() {
	echo "Usage: realpath [options] path [...]"
	echo "  -h		print these usage instructions"
}

function realpath()
{
	local success=true
	local path="$1"

	# make sure the string isn't empty as that implies something in further logic
	if [ -z "$path" ]; then
		success=false
	else
		# start with the file name (sans the trailing slash)
		path="${path%/}"

		# if we stripped off the trailing slash and were left with nothing, that means we're in the root directory
		if [ -z "$path" ]; then
			path="/"
		fi

		# get the basename of the file (ignoring '.' & '..', because they're really part of the path)
		local file_basename="${path##*/}"
		if [[ ( "$file_basename" = "." ) || ( "$file_basename" = ".." ) ]]; then
			file_basename=""
		fi

		# extracts the directory component of the full path, if it's empty then assume '.' (the current working directory)
		local directory="${path%$file_basename}"
		if [ -z "$directory" ]; then
			directory='.'
		fi

		# attempt to change to the directory
		if ! cd "$directory" &>/dev/null ; then
			success=false
		fi

		if $success; then
			# does the filename exist?
			if [[ ( -n "$file_basename" ) && ( ! -e "$file_basename" ) ]]; then
				success=false
			fi

			# get the absolute path of the current directory & change back to previous directory
			local abs_path="$(pwd -P)"
			cd "-" &>/dev/null

			# Append base filename to absolute path
			if [ "${abs_path}" = "/" ]; then
				abs_path="${abs_path}${file_basename}"
			else
				abs_path="${abs_path}/${file_basename}"
			fi

			# output the absolute path
			echo "$abs_path"
		fi
	fi

	$success
}

# see if any arguments were passed in
success=true
if [ $# -gt 0 ]; then
	# if so, step through them all and process them
	while [ $# -gt 0 ]; do
		# see if the user requested help
		if [ "$1" = "-h" ]; then
			usage
			exit 0
		else
			# try determine the absolute path for each path specified
			path=$(realpath "$1")
			if [ $? -ne 0 ]; then
				success=false
			else
				echo "$(dirname "$path"/.)"
			fi
			shift
		fi
	done
else
	printf "No paths were specified to be converted to absolute paths.\n\n"
	usage
	success=false
fi

$success
