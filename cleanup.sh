#!/bin/bash

# Enable verbose mode for better troubleshooting
set -x

# Define the directories and file to delete
declare -a paths=("artifacts/" "cache/" "ignition/deployments/" "typechain-types/" "merkleTree.json")

# Loop through each path and delete if it exists
for path in "${paths[@]}"
do
    if [ -e "$path" ]; then
        echo "Attempting to delete $path..."
        
        # Use 'rm' with -v (verbose) to display progress of deletions
        rm -rfv "$path"
        
        if [ $? -eq 0 ]; then
            echo "Successfully deleted $path"
        else
            echo "Failed to delete $path"
        fi
    else
        echo "$path does not exist."
    fi
done

echo "Cleanup complete."

# Disable verbose mode
set +x
