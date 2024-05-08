import { css } from "@emotion/react";
import { BeatLoader,SyncLoader,HashLoader } from "react-spinners";

const override = css`
  position: fixed; /* Ensures absolute positioning for proper centering */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center based on its own dimensions */
  height: auto; /* Allow loader to adjust to its natural height */
  width: auto;  /* Allow loader to adjust to its natural width */
  background-color: rgba(0, 0, 0, 0.2); /* Optional background color */
`;

function Loader() {
  return (
    <div css={override}>
      <div style={{ textAlign: 'center' }}>
        <SyncLoader color={"green"} loading={true} size={50} />
      </div>
    </div>
  );
}

export default Loader;
