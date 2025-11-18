// controllers/customerMembershipController.js
import customerMembershipService from "../services/customerMembershipService.js";

class CustomerMembershipController {
  async getAll(req, res) {
    try {
      const { customerId } = req.params;
      const memberships = await customerMembershipService.getAllMemberships(customerId);
      res.json({ memberships });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const { customerId } = req.params;
      const memberships = await customerMembershipService.getActiveMemberships(customerId);
      res.json({ memberships });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new CustomerMembershipController();