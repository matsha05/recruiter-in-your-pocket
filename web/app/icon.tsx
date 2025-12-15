import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation - Solid Pocket Icon
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "#09090b",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* 
                      Solid Pocket Silhouette 
                      A filled shape reads much faster as "object" than an outline.
                      The 'hem' is created by a distinct top section or a negative space line.
                      
                      Here: A solid pocket body.
                    */}
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5 6C5 4.89543 5.89543 4 7 4H17C18.1046 4 19 4.89543 19 6V13C19 16.866 15.866 20 12 20C8.13401 20 5 16.866 5 13V6ZM7 6H17V7H7V6Z"
                        fill="white"
                    />
                    {/* 
                      Top Hem Line (Negative Space) 
                      A subtle 1px transparent line or gap to define the top fold.
                      Actually, let's just use a simple filled path that includes the geometry.
                      
                      Top Rect: 4->8 height
                      Bottom Body: 8->20 rounded
                    */}
                    <path
                        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8H4V6Z"
                        fill="white"
                    />
                    <path
                        d="M4 10H20V14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14V10Z"
                        fill="white"
                    />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
