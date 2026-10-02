"""MCP server exposing Gemini image generation as a tool (concept images).

Needs GEMINI_API_KEY in the environment. GEMINI_IMAGE_MODEL overrides the
model; whether it is free depends on your key's quota.
"""
import mimetypes
import os

from mcp.server.mcpserver import MCPServer

MODEL = os.environ.get("GEMINI_IMAGE_MODEL") or "gemini-2.5-flash-image"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

mcp = MCPServer("gemini-image")


def _abs(path):
    return path if os.path.isabs(path) else os.path.join(ROOT, path)


@mcp.tool()
def generate_image(prompt: str, output_path: str, reference_image: str = "") -> str:
    """Generate an image with Gemini and save it. Optionally pass reference_image
    (a local path) to edit it or keep the same character across views. Paths may
    be absolute or relative to the project root."""
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return "Error: GEMINI_API_KEY is not set in the environment."
    from google import genai
    from google.genai import types

    contents = []
    if reference_image:
        ref = _abs(reference_image)
        if not os.path.isfile(ref):
            return f"Error: reference image not found: {ref}"
        mime = mimetypes.guess_type(ref)[0] or "image/png"
        with open(ref, "rb") as f:
            contents.append(types.Part.from_bytes(data=f.read(), mime_type=mime))
    contents.append(prompt)

    try:
        response = genai.Client(api_key=key).models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
        )
    except Exception as e:  # quota, auth and model errors all end up here
        return f"Error from Gemini ({MODEL}): {str(e)[:400]}"

    for cand in response.candidates or []:
        for part in cand.content.parts or []:
            if part.inline_data and part.inline_data.data:
                dst = _abs(output_path)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                with open(dst, "wb") as f:
                    f.write(part.inline_data.data)
                return f"Saved {dst} ({len(part.inline_data.data)} bytes, model {MODEL})."
    return f"Error: {MODEL} returned no image. Text: {(response.text or '')[:200]}"


if __name__ == "__main__":
    mcp.run()
