"""MCP server exposing free image -> 3D (TRELLIS on Hugging Face) as a tool.

Register in .mcp.json; set HF_TOKEN in the environment for a larger quota.
"""
import os
import sys

from mcp.server.mcpserver import MCPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trellis_hf import generate_glb  # noqa: E402

mcp = MCPServer("trellis")


@mcp.tool()
def image_to_glb(image_path: str, output_path: str, seed: int = 0) -> str:
    """Generate a textured GLB from one front-view image using the free TRELLIS
    Hugging Face Space. Takes 1-3 minutes. Paths may be absolute or relative to
    the project root. Fails with a quota message when ZeroGPU quota is used up."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = image_path if os.path.isabs(image_path) else os.path.join(root, image_path)
    dst = output_path if os.path.isabs(output_path) else os.path.join(root, output_path)
    if not os.path.isfile(src):
        return f"Error: image not found: {src}"
    size = generate_glb(src, dst, seed)
    return f"Saved {dst} ({size} bytes). Import it into Blender with execute_blender_code."


if __name__ == "__main__":
    mcp.run()
