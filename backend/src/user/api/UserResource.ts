import { userRequestAssembler, uploadProfilePictureRequestAssembler, userService } from "../../AppContext";
import { status } from "../../api/Status";
import express, { Response, Request } from "express";
import { body, validationResult } from "express-validator";
import { isUnusedEmail } from "./validators/isUnusedEmail";
import UserDto from "./dto/UserDto";
import UserRequest from "../service/UserRequest";
import { handleUpdateUserInformationException } from "./ExceptionHandler";
import UploadProfilePictureRequest from "./UploadProfilePictureRequest";
import UploadProfilePictureRequestBody from "./UploadProfilePictureRequestBody";

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/user/:username", async (req: Request<Record<string, unknown>, Record<string, unknown>>, res: Response) => {
  try {
    const username = req.params.username as string;
    const userResponse = await userService.findByUsername(username);
    res.status(status.OK).send(userResponse);
  } catch (e) {
    res.status(status.NOT_FOUND).send(e.message);
  }
});

router.put(
  "/user/:username",
  body("email").isEmail().withMessage("Email is not valid ").custom(isUnusedEmail),
  body("firstName").exists().withMessage("The first name field is required"),
  body("lastName").exists().withMessage("The last name field is required"),
  body("phoneNumber").isMobilePhone("any").withMessage("Phone number is not valid"),
  async (req: Request<Record<string, unknown>, Record<string, unknown>, UserDto>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(status.BAD_REQUEST).json({ errors: errors.array() });
    }

    try {
      const userRequest: UserRequest = userRequestAssembler.assembleUserRequest(req.body);
      const userResponse = await userService.updateUserInformation(userRequest);
      return res.status(status.OK).json(userResponse);
    } catch (e) {
      return handleUpdateUserInformationException(e, res);
    }
  }
);

router.post(
  "/user/uploadProfilePicture",
  upload.single("image"),
  async (req: Request<Record<string, unknown>, Record<string, unknown>>, res: Response) => {
    try {
      const uploadProfilePictureRequest: UploadProfilePictureRequestBody =
        uploadProfilePictureRequestAssembler.assembleUploadProfilePictureRequestBody(req as UploadProfilePictureRequest);

      const userResponse = await userService.uploadProfilePicture(uploadProfilePictureRequest);
      res.status(status.OK).send(userResponse);
    } catch (e) {
      res.status(status.BAD_REQUEST).send(e.message);
    }
  }
);

module.exports = router;
