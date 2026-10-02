"""Image -> GLB through the free TRELLIS Hugging Face Space (no GPU needed).

Usage: python tools/trellis_hf.py concept/front.png assets/mascot_trellis.glb [seed]
Optional: set HF_TOKEN for a larger ZeroGPU quota.
"""
import os
import shutil
import sys

from gradio_client import Client, handle_file

SPACE = "trellis-community/TRELLIS"


def generate_glb(src, dst, seed=0):
    client = Client(SPACE, token=os.environ.get("HF_TOKEN") or None, verbose=False)
    client.predict(api_name="/start_session")
    image = client.predict(handle_file(src), api_name="/preprocess_image")
    _, _, glb = client.predict(
        handle_file(image),
        [],
        seed,
        7.5,
        12,
        3.0,
        12,
        "stochastic",
        0.95,
        1024,
        api_name="/generate_and_extract_glb",
    )
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    shutil.copyfile(glb, dst)
    return os.path.getsize(dst)


if __name__ == "__main__":
    size = generate_glb(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
    print("saved", sys.argv[2], size, "bytes")
