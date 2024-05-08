import { css } from "@emotion/react";
import { BeatLoader } from "react-spinners";

const override = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ensures full viewport height */
  top:50%;
  right:50%;
  background-color: rgba(0, 0, 0, 0.2); /* Optional background color */
`;

function Loader() {
  return (
    <div css={override}>
      <div style={{ textAlign: 'center' }}>
        <BeatLoader color={"green"} loading={true} size={50} />
      </div>
    </div>
  );
}

export default Loader;
